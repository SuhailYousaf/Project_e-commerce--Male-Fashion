const db = require("../config/connection");
const collection = require("../config/collection");
const objectId = require("mongodb-legacy").ObjectId;
const { ObjectId } = require("mongodb"); // import ObjectId from mongodb
const { ifUserLoggedIn } = require("../middleware/verifySession");
module.exports = {
    //Admin Login
    doAdminLogin: (adminDetails) => {
        return new Promise(async (resolve, reject) => {
            const response = {};
            const admin = await db
                .get()
                .collection(collection.ADMIN_COLLECTION)
                .findOne({ email: adminDetails.email });
            if (admin) {
                if (admin.password == adminDetails.password) {
                    response.admin = admin;
                    resolve(response);
                } else {
                    response.status = "Invalid password";
                    resolve(response);
                }
            } else {
                response.status = "Invalid user";
                resolve(response);
            }
        });
    },
    //User CRUD
    getUser: () => {
        return new Promise(async (resolve, reject) => {
            const userData = await db
                .get()
                .collection(collection.USER_COLLECTION)
                .find()
                .toArray();
            resolve(userData);
        });
    },
    editUser: (userId, data) => {
        return new Promise((resolve, reject) => {
            userId = new objectId(userId);
            db.get()
                .collection(collection.USER_COLLECTION)
                .updateOne(
                    {
                        _id: new objectId(userId),
                    },
                    {
                        $set: {
                            name: data.name,
                            email: data.email,
                            phone: Number(data.phone),
                        },
                    }
                )
                .then((response) => {
                    resolve();
                })
                .catch((err) => {
                    reject(err);
                });
        });
    },
    deletUser: (userId) => {
        return new Promise((resolve, reject) => {
            userId = new objectId(userId);
            db.get()
                .collection(collection.USER_COLLECTION)
                .deleteOne({
                    _id: new objectId(userId),
                })
                .then((response) => {
                    resolve();
                })
                .catch((err) => {
                    console.log(err);
                    reject();
                });
        });
    },
    blockUser: (userId) => {
        return new Promise(async (resolve, reject) => {
            userId = new objectId(userId);
            const user = await db
                .get()
                .collection(collection.USER_COLLECTION)
                .findOne({
                    _id: new objectId(userId),
                });
            if (user.status == true) {
                db.get()
                    .collection(collection.USER_COLLECTION)
                    .updateOne(
                        {
                            _id: new objectId(userId),
                        },
                        {
                            $set: {
                                status: false,
                            },
                        }
                    )
                    .then((response) => {
                        resolve(response);
                    })
                    .catch((err) => {
                        reject(err);
                    });
            } else {
                db.get()
                    .collection(collection.USER_COLLECTION)
                    .updateOne(
                        {
                            _id: new objectId(userId),
                        },
                        {
                            $set: {
                                status: true,
                            },
                        }
                    )
                    .then((response) => {
                        resolve(response);
                    })
                    .catch((err) => {
                        reject(err);
                    });
            }
        });
    },

    suser: (search) => {
        return new Promise(async (resolve, reject) => {
            const userData = await db
                .get()
                .collection(collection.USER_COLLECTION)
                .find({
                    name: { $regex: new RegExp(search) },
                })
                .toArray()
                .then((users) => {
                    resolve(users);
                })
                .catch(() => {
                    reject(err);
                });
        });
    },
    //admin order
    getSingle: (orderId) => {
        return new Promise((resolve, reject) => {
            db.get()
                .collection(collection.ORDER_COLLECTION)
                .findOne({ _id: new objectId(orderId) })
                .then((orderData) => {
                    if (orderData) {
                        const userId = orderData.userId;
                        orderData.userId = userId;
                        resolve(userId);
                    } else {
                        reject(new Error("Order not found"));
                    }
                })
                .catch((error) => {
                    reject(error);
                });
        });
    },
    getUserOrder: () => {
        return new Promise(async (resolve, reject) => {
            const userDet = await db
                .get()
                .collection(collection.ORDER_COLLECTION)
                .find()
                .sort({ _id: -1 })
                .toArray();
            resolve(userDet);
        });
    },
    adminOrderStatus: (orderId, status) => {
        return new Promise((resolve, reject) => {
            db.get()
                .collection(collection.ORDER_COLLECTION)
                .findOne({ _id: new objectId(orderId) })
                .then((order) => {
                    if (order.status === "Cancelled") {
                        reject("User has already cancelled the product");
                    } else {
                        db.get()
                            .collection(collection.ORDER_COLLECTION)
                            .updateOne(
                                { _id: new objectId(orderId) },
                                {
                                    $set: {
                                        status:
                                            status === "cancelled"
                                                ? "Cancelled"
                                                : status,
                                    },
                                }
                            )
                            .then((response) => {
                                resolve(response);
                            })
                            .catch((error) => {
                                console.log("Error updating status:", error);
                                reject(error);
                            });
                    }
                })
                .catch((error) => {
                    console.log("Error finding order:", error);
                    reject(error);
                });
        });
    },
    getSingleOrder: (orderId) => {
        return new Promise(async (resolve, reject) => {
            const orderDet = await db
                .get()
                .collection(collection.ORDER_COLLECTION)
                .findOne({
                    _id: new objectId(orderId),
                });
            resolve(orderDet);
        });
    },
    adminSearchProduct: (serach) => {
        return new Promise(async (resolve, reject) => {
            await db
                .get()
                .collection(collection.PRODUCT_COLLECTION)
                .find({
                    name: { $regex: new RegExp(serach), $options: "i" },
                })
                .toArray()
                .then((productData) => {
                    resolve(productData);
                })
                .catch((err) => {
                    reject(err);
                });
        });
    },
    adminRefund: (orderId, userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                const order = await db
                    .get()
                    .collection(collection.ORDER_COLLECTION)
                    .findOne({ _id: new ObjectId(orderId) });

                if (order) {
                    const balance = order.total;
                    const date = order.date;
                    const walletCollection = db
                        .get()
                        .collection(collection.WALLET_COLLECTION);
                    const existingWallet = await walletCollection.findOne({
                        _id: new ObjectId(userId),
                    });
                    if (existingWallet) {
                        const existingBalance = existingWallet.balance;
                        const updatedBalance = existingBalance + balance;
                        await walletCollection.updateOne(
                            { _id: new ObjectId(userId) },
                            { $set: { balance: updatedBalance } }
                        );
                    } else {
                        await walletCollection.insertOne({
                            _id: new ObjectId(userId),
                            orderId: new ObjectId(orderId),
                            date: date,
                            balance: balance,
                        });
                    }
                    await db
                        .get()
                        .collection(collection.ORDER_COLLECTION)
                        .updateOne(
                            { _id: new ObjectId(orderId) },
                            { $set: { refunded: true } }
                        );

                    resolve();
                } else {
                    reject(new Error("Order not found"));
                }
            } catch (error) {
                reject(error);
            }
        });
    },
    //viewdatils in order
    getOrderedProducts: (ordersId) => {
        return new Promise(async (resolve, reject) => {
            ordersId = new objectId(ordersId);
            const orders = await db
                .get()
                .collection(collection.ORDER_COLLECTION)
                .find({ _id: ordersId })
                .toArray();
            resolve(orders);
        });
    },
    //amdin coupon
    getCoupon: () => {
        return new Promise(async (resolve, reject) => {
            const coupons = await db
                .get()
                .collection(collection.COUPON_COLLECTION)
                .find()
                .toArray();
            const newDate = new Date();
            coupons.forEach((coupon) => {
                if (coupon.date < newDate) {
                    coupon.status = "Expired";
                }

                const date = new Date(coupon.date); // Initialize date as a Date object
                const year = date.getFullYear();
                const month = date.getMonth() + 1; // Add 1 because months are zero-indexed
                const day = date.getDate();
                const formattedDate = `${day < 10 ? "0" + day : day}-${
                    month < 10 ? "0" + month : month
                }-${year}`;
                coupon.date = formattedDate;
            });
            resolve(coupons);
        });
    },
    adminAddCoupon: (coupon) => {
        return new Promise(async (resolve, reject) => {
            coupon.discount = Number(coupon.discount);
            coupon.date = new Date(coupon.date);
            coupon.status = true;
            const newDate = new Date();

            if (coupon.date < newDate) {
                coupon.status = "Expired";
            }

            const couponExist = await db
                .get()
                .collection(collection.COUPON_COLLECTION)
                .findOne({ code: coupon.code });

            if (couponExist) {
                resolve({ success: false, message: "Coupon already exists" });
            } else {
                db.get()
                    .collection(collection.COUPON_COLLECTION)
                    .insertOne(coupon)
                    .then(() => {
                        resolve({
                            success: true,
                            message: "Coupon added successfully",
                        });
                    })
                    .catch((error) => {
                        reject({
                            success: false,
                            message: "Failed to add coupon",
                        });
                    });
            }
        });
    },
    deactivateoCupon: (couponId) => {
        return new Promise((resolve, reject) => {
            db.get()
                .collection(collection.COUPON_COLLECTION)
                .updateOne(
                    {
                        _id: new objectId(couponId),
                    },
                    {
                        $set: {
                            status: "Deactivated",
                        },
                    }
                )
                .then(() => {
                    resolve();
                })
                .catch(() => {
                    reject();
                });
        });
    },

    activateCoupon: (couponId) => {
        return new Promise((resolve, reject) => {
            db.get()
                .collection(collection.COUPON_COLLECTION)
                .updateOne(
                    {
                        _id: new objectId(couponId),
                    },
                    {
                        $set: {
                            status: "Activated",
                        },
                    }
                )
                .then(() => {
                    resolve();
                })
                .catch(() => {
                    reject();
                });
        });
    },
    adminEditCoupon: (couponId, coupon) => {
        return new Promise((resolve, reject) => {
            coupon.data = new Date(coupon.data);
            coupon.status = true;
            const newDate = new Date();
            if (coupon.date < newDate) {
                coupon.status = "Expired";
            }
            db.get()
                .collection(collection.COUPON_COLLECTION)
                .updateOne(
                    {
                        _id: new objectId(couponId),
                    },

                    {
                        $set: {
                            code: coupon.code,
                            discount: Number(coupon.discount),
                            description: coupon.description,
                            date: coupon.date,
                            status: coupon.status,
                        },
                    }
                )
                .then(() => {
                    resolve();
                })
                .catch(() => {
                    reject();
                });
        });
    },
    //adminSalesReport
    getUsersCount: () => {
        return new Promise((resolve, reject) => {
            const users = db
                .get()
                .collection(collection.USER_COLLECTION)
                .countDocuments({});
            resolve(users);
        });
    },
    getLastMonthTotal: () => {
        return new Promise(async (resolve, reject) => {
            try {
                const lastMonth = new Date();
                lastMonth.setMonth(lastMonth.getMonth() - 1);
                const total = await db
                    .get()
                    .collection(collection.ORDER_COLLECTION)
                    .aggregate([
                        {
                            $match: {
                                status: "Delivered",
                                date: { $gte: lastMonth },
                            },
                        },
                        {
                            $group: {
                                _id: 0,
                                total: { $sum: { $toDouble: "$total" } },
                            },
                        },
                    ])
                    .toArray();
                if (total.length > 0) {
                    resolve(total[0].total);
                } else {
                    resolve(0);
                }
            } catch (err) {
                reject(err);
            }
        });
    },
    getOrderTotalPrice: () => {
        return new Promise(async (resolve, reject) => {
            const totalOrderPrice = await db
                .get()
                .collection(collection.ORDER_COLLECTION)
                .aggregate([
                    {
                        $match: {
                            status: "Delivered",
                        },
                    },
                    {
                        $group: {
                            _id: 0,
                            total: { $sum: { $toDouble: "$total" } },
                        },
                    },
                ])
                .toArray();

            if (totalOrderPrice.length > 0) {
                resolve(totalOrderPrice[0].total);
            } else {
                resolve(0);
            }
        });
    },
    getMonthCount: (month, year) => {
        return new Promise(async (resolve, reject) => {
            try {
                const startDate = new Date(year, month - 1, 1); //Month Index starts from 0
                const endDate = new Date(year, month, 0);
                const count = await db
                    .get()
                    .collection(collection.ORDER_COLLECTION)
                    .countDocuments({
                        status: "Delivered",
                        date: { $gte: startDate, $lte: endDate },
                    });

                resolve(count);
            } catch (err) {
                reject(err);
            }
        });
    },
    getAllDeliveredOrders: () => {
        return new Promise(async (resolve, reject) => {
            const deliveredOrders = await db
                .get()
                .collection(collection.ORDER_COLLECTION)
                .find({
                    status: "Delivered",
                })
                .toArray();
            resolve(deliveredOrders);
        });
    },
    filterDate: (dates) => {
        return new Promise(async (resolve, reject) => {
            let newDate = [];
            dates.forEach((eachDate) => {
                const date = new Date(eachDate);
                const year = date.getFullYear();
                const month = date.getMonth() + 1; // add 1 because months are zero-indexed
                const day = date.getDate();
                const formattedDate = `${year}-${
                    month < 10 ? "0" + month : month
                }-${day < 10 ? "0" + day : day}`;
                newDate.push(formattedDate);
            });
            const report = await db
                .get()
                .collection(collection.ORDER_COLLECTION)
                .aggregate([
                    {
                        $match: {
                            status: "Delivered",
                            date: {
                                $gte: new Date(newDate[0]),
                                $lte: new Date(newDate[1]),
                            },
                        },
                    },
                ])
                .toArray();
            resolve(report);
        });
    },
    getAllDeliveredOrdersCount: () => {
        return new Promise((resolve, reject) => {
            db.get()
                .collection(collection.ORDER_COLLECTION)
                .find({
                    status: "Delivered",
                })
                .count({})
                .then((count) => {
                    resolve(count);
                })
                .catch((err) => {
                    reject(err);
                });
        });
    },
    getAllPlacedOrdersCount: () => {
        return new Promise((resolve, reject) => {
            db.get()
                .collection(collection.ORDER_COLLECTION)
                .find({
                    status: "placed",
                })
                .count({})
                .then((count) => {
                    resolve(count);
                })
                .catch((err) => {
                    reject(err);
                });
        });
    },
    getAllCanceldOrdersCount: () => {
        return new Promise((resolve, reject) => {
            db.get()
                .collection(collection.ORDER_COLLECTION)
                .find({
                    status: "Cancelled",
                })
                .count({})
                .then((count) => {
                    resolve(count);
                })
                .catch((err) => {
                    reject(err);
                });
        });
    },
    getAllReturnOrdersCount: () => {
        return new Promise((resolve, reject) => {
            db.get()
                .collection(collection.ORDER_COLLECTION)
                .find({
                    status: "Return",
                })
                .count({})
                .then((count) => {
                    resolve(count);
                })
                .catch((err) => {
                    reject(err);
                });
        });
    },
    // Admin Banner
    getBanner: () => {
        return new Promise(async (resolve, reject) => {
            const banner = await db
                .get()
                .collection(collection.BANNER_COLLECTION)
                .find()
                .toArray();
            resolve(banner);
        });
    },
    addBanner: (banner) => {
        return new Promise((resolve, reject) => {
            db.get()
                .collection(collection.BANNER_COLLECTION)
                .insertOne(banner)
                .then((response) => {
                    resolve(response);
                });
        });
    },
    adminBannerImageEdit: (bannerId, imageUrl) => {
        return new Promise((resolve, reject) => {
            db.get()
                .collection(collection.BANNER_COLLECTION)
                .updateOne(
                    {
                        _id: new objectId(bannerId),
                    },
                    {
                        $set: {
                            image: imageUrl,
                        },
                    }
                )
                .then((response) => {
                    resolve(response);
                });
        });
    },
    adminEditBanner: (bannerId, banner) => {
        return new Promise((resolve, reject) => {
            db.get()
                .collection(collection.BANNER_COLLECTION)
                .updateOne(
                    {
                        _id: new objectId(bannerId),
                    },

                    {
                        $set: {
                            heading: banner.heading,
                        },
                    }
                )
                .then((response) => {
                    resolve(response);
                });
        });
    },
    adminActivateBanner: (bannerId) => {
        return new Promise((resolve, reject) => {
            db.get()
                .collection(collection.BANNER_COLLECTION)
                .updateMany(
                    {},
                    {
                        $set: {
                            active: false,
                        },
                    }
                );

            db.get()
                .collection(collection.BANNER_COLLECTION)
                .updateOne(
                    {
                        _id: new objectId(bannerId),
                    },

                    {
                        $set: {
                            active: true,
                        },
                    }
                )
                .then((response) => {
                    resolve(response);
                });
        });
    },
};
