const adminHelpers = require("../helpers/adminHelpers");
const productHelpers = require("../helpers/productHelpers");
const userHelpers = require("../helpers/userHelpers");
const categoryHelpers = require("../helpers/categoryhelpers");
const cloudinary = require("../utils/cloudinary");
const { response } = require("../app");

module.exports = {
    // Admin Login & Logout
    adminLogin: (req, res) => {
        if (req.session.adminLoggedIn) {
            res.redirect("/adminPanel");
        } else {
            const adminName = req.session.adminName;
            res.render("admin/login", {
                admin: true,
                passErr: req.session.passErr,
                emailErr: req.session.emailErr,
                adminName,
            });
            req.session.passErr = false;
            req.session.emailErr = false;
        }
    },

    adminLoginPost: (req, res) => {
        adminHelpers.doAdminLogin(req.body).then(async (response) => {
            if (response.status == "Invalid password") {
                req.session.passErr = response.status;
                res.redirect("/admin");
            } else if (response.status == "Invalid user") {
                req.session.emailErr = response.status;
                res.redirect("/admin");
            } else {
                req.session.admin = response.admin;
                req.session.adminName = req.session.admin.email;
                req.session.adminLoggedIn = true;
                res.redirect("/admin/adminPanel");
            }
        });
    },

    adminLogout: (req, res) => {
        req.session.adminLoggedIn = false;
        req.session.adminName = false;
        res.redirect("/admin");
    },

    //Admin Panel
    adminPanel: async (req, res) => {
        const jan = await adminHelpers.getMonthCount(1, 2023);
        const feb = await adminHelpers.getMonthCount(2, 2023);
        const mar = await adminHelpers.getMonthCount(3, 2023);
        const apr = await adminHelpers.getMonthCount(4, 2023);
        const may = await adminHelpers.getMonthCount(5, 2023);
        const jun = await adminHelpers.getMonthCount(6, 2023);
        const userCount = await adminHelpers.getUsersCount();
        const total = await adminHelpers.getLastMonthTotal();
        const totalOrdersPlaced = await productHelpers.totalOrdersPlaced();
        let totalEarnings = 0;
        totalEarnings = await adminHelpers.getOrderTotalPrice();
        const deliveredCounts = await adminHelpers.getAllDeliveredOrdersCount();
        const placedCounts = await adminHelpers.getAllPlacedOrdersCount();
        const cancelledCounts = await adminHelpers.getAllCanceldOrdersCount();
        const returnCounts = await adminHelpers.getAllReturnOrdersCount();
        res.render("admin/adminPanel", {
            admin: true,
            adminName: req.session.adminName,
            deliveredCounts,
            placedCounts,
            cancelledCounts,
            returnCounts,
            userCount,
            totalOrdersPlaced,
            total,
            totalEarnings,
            jan,
            feb,
            mar,
            apr,
            may,
            jun,
        });
    },

    //Admin User CRUD
    adminUserManagement: async (req, res) => {
        const adminName = req.session.adminName;
        const userData = await adminHelpers.getUser();
        res.render("admin/adminUserManagement", {
            admin: true,
            adminName,
            userData,
        });
    },

    adminAddUser: (req, res) => {
        const adminName = req.session.adminName;
        res.render("admin/adminAddUser", { admin: true, adminName });
    },

    adminAddUserPost: (req, res) => {
        userHelpers
            .doSignUp(req.body)
            .then((response) => {
                if (response == "Email already exist!!!") {
                    req.session.emailExist = response;
                    res.redirect("back");
                } else {
                    res.redirect("back");
                }
            })
            .catch((err) => {
                console.log(err);
            });
    },

    adminEditUser: (req, res) => {
        const userId = req.params.id;
        adminHelpers
            .editUser(userId, req.body)
            .then(() => {
                res.redirect("/admin/adminUserManagement");
            })
            .catch((err) => {
                console.log(err);
            });
    },

    adminDeleteUser: (req, res) => {
        const userId = req.params.id;
        adminHelpers
            .deletUser(userId)
            .then(() => {
                res.redirect("/admin/adminUserManagement");
            })
            .catch((err) => {
                console.log(err);
            });
    },

    adminBlockUser: (req, res) => {
        const userId = req.params.id;
        adminHelpers
            .blockUser(userId)
            .then(() => {
                res.redirect("/admin/adminUserManagement");
            })
            .catch((err) => {
                console.log(err);
            });
    },

    adminsearchuser: (req, res) => {
        const userId = req.params.id;
        adminHelpers
            .suser(userId)
            .then(() => {
                res.redirect("/admin/adminUserManagement");
            })
            .catch((err) => {
                console.log(err);
            });
    },

    //Admin Product CRUD
    adminProduct: async (req, res) => {
        const adminName = req.session.adminName;
        //pagination
        const totalPages = await productHelpers.totalPages();
        const currentPage = req.query.page || 1;

        const productData = await productHelpers.getProductsAdmin(currentPage);
        res.render("admin/adminProduct", {
            admin: true,
            adminName,
            productData,
            totalPages,
        });
    },

    adminAddProduct: (req, res) => {
        const adminName = req.session.adminName;
        categoryHelpers.getCategory().then((category) => {
            console.log(category);
            res.render("admin/adminAddProduct", {
                admin: true,
                adminName,
                category,
            });
        });
    },

    adminAddProductPost: (req, res) => {
        productHelpers.addProducts(req.body).then(async (id) => {
            const imgUrls = [];
            try {
                for (let i = 0; i < req.files.length; i++) {
                    const result = await cloudinary.uploader.upload(
                        req.files[i].path
                    );
                    imgUrls.push(result.url);
                }
                productHelpers
                    .addProductImage(id, imgUrls)
                    .then(() => {})
                    .catch(() => {});
            } catch (err) {
            } finally {
                res.redirect("/admin/adminAddProduct");
            }
        });
    },

    adminEditProduct: (req, res) => {
        const productId = req.params.id;
        productHelpers.editProduct(productId, req.body).then(async () => {
            const imgUrls = [];
            try {
                for (let i = 0; i < req.files.length; i++) {
                    const result = await cloudinary.uploader.upload(
                        req.files[i].path
                    );
                    imgUrls.push(result.url);
                }
                if (imgUrls.length > 0) {
                    productHelpers
                        .editProductImage(productId, imgUrls)
                        .then(() => {})
                        .catch(() => {});
                }
            } catch (err) {
                console.log(`error : ${err}`);
            } finally {
                res.redirect("/admin/adminProduct");
            }
        });
    },

    adminDeleteProduct: (req, res) => {
        const productId = req.params.id;
        productHelpers
            .deleteProducts(productId)
            .then(() => {
                res.redirect("/admin/adminProduct");
            })
            .catch((err) => {
                console.log(err);
            });
    },

    adminSearchProduct: async (req, res) => {
        const adminName = req.session.adminName;
        const product = await adminHelpers.adminSearchProduct(req.body.name);
        res.render("admin/adminProduct", { admin: true, adminName, product });
    },
    // Admin Category Management
    getCategory: (req, res) => {
        const adminName = req.session.adminName;
        categoryHelpers.getCategory().then((category) => {
            res.render("admin/adminCategory", {
                admin: true,
                adminName,
                category,
            });
        });
    },

    addCategory: (req, res) => {
        try {
            categoryHelpers
                .addCategory(req.body)
                .then((response) => {
                    if (response.status === false) {
                        // Category already added
                        res.redirect("/admin/adminCategory?success=false");
                    } else {
                        // Category added successfully
                        res.redirect("/admin/adminCategory?success=true");
                    }
                })
                .catch((err) => {
                    // Handle the error here and show an alert to the admin
                    res.status(500).json({ error: err });
                });
        } catch (error) {
            res.redirect("back");
        }
    },
    // Orders

    deleteCategory: (req, res) => {
        const category = req.params.id;
        const cateName = req.params.name;
        categoryHelpers
            .deleteCategory(category, cateName)
            .then(() => {
                res.redirect("/admin/adminCategory");
            })
            .catch((err) => {
                console.log(err);
            });
    },

    adminOrder: (req, res) => {
        const adminName = req.session.adminName;
        adminHelpers.getUserOrder().then((adminOrder) => {
            res.render("admin/adminOrder", {
                admin: true,
                adminName,
                adminOrder,
            });
        });
    },

    adminOrderStatus: (req, res) => {
        const orderId = req.params.id;
        const status = req.body.status;
        adminHelpers
            .adminOrderStatus(orderId, status)
            .then(() => {
                res.redirect("back");
            })
            .catch((error) => {
                console.log("Error:", error);
                res.redirect("back");
            });
    },

    adminOrderView: async (req, res) => {
        const orderId = req.params.id;
        const order = await adminHelpers.getSingleOrder(orderId);
        res.render("admin/adminOrderView", {
            admin: true,
            adminName: req.session.adminName,
            order,
        });
    },

    adminRefund: async (req, res) => {
        const orderId = req.params.id;
        const userId = await adminHelpers.getSingle(orderId);
        console.log("userId");
        console.log(userId);
        console.log("req.body.order.userId");
        adminHelpers.adminRefund(orderId, userId).then(() => {
            res.redirect("back");
        });
    },

    //view Details

    viewDetails: async (req, res) => {
        const adminName = req.session.adminName;
        const orderId = req.params.id;
        adminHelpers.getOrderedProducts(orderId).then((orders) => {
            if (req.session.admin) {
                res.render("admin/viewDetails", {
                    admin: true,
                    adminName,
                    orders,
                });
            } else {
                res.render("user/viewDetails", {
                    admin: false,
                    adminName,
                    orders,
                });
            }
        });
    },

    //admin coupon
    adminCoupon: async (req, res) => {
        const coupons = await adminHelpers.getCoupon();
        coupons.forEach((coupon) => {
            coupon.deactivate = coupon.status === "Deactivated" ? true : false;
            coupon.expired = coupon.status === "Expired" ? true : false;
        });
        res.render("admin/adminCoupon", {
            admin: true,
            adminName: req.session.adminName,
            coupons,
        });
    },

    adminAddCoupon: (req, res) => {
        adminHelpers
            .adminAddCoupon(req.body)
            .then((response) => {
                res.json(response); // Send the response as JSON
            })
            .catch(() => {
                res.json({ success: false, message: "Failed to add coupon" });
            });
    },

    adminDeactivate: (req, res) => {
        const couponId = req.params.id;
        adminHelpers
            .deactivateoCupon(couponId)
            .then(() => {
                res.redirect("/admin/adminCoupon");
            })
            .catch(() => {
                res.redirect("/admin/adminCoupon");
            });
    },

    adminActivate: (req, res) => {
        const couponId = req.params.id;
        adminHelpers
            .activateCoupon(couponId)
            .then(() => {
                res.redirect("/admin/adminCoupon");
            })
            .catch(() => {
                res.redirect("/admin/adminCoupon");
            });
    },
    adminEditCoupon: (req, res) => {
        const couponId = req.params.id;
        adminHelpers.adminEditCoupon(couponId, req.body).then(() => {
            res.redirect("/admin/adminCoupon");
        });
    },

    //adminSalesReport
    adminSalesReport: async (req, res) => {
        const deliveredOrders = await adminHelpers.getAllDeliveredOrders();
        let totalEarnings = 0;
        totalEarnings = await adminHelpers.getOrderTotalPrice();
        deliveredOrders.forEach((eachOrder) => {
            eachOrder.productCount = eachOrder.products.length;
            // date formatting
            const newDate = new Date(eachOrder.date);
            const year = newDate.getFullYear();
            const month = newDate.getMonth() + 1;
            const day = newDate.getDate();
            const formattedDate = `${day < 10 ? "0" + day : day}-${
                month < 10 ? "0" + month : month
            }-${year}`;
            eachOrder.date = formattedDate;
        });
        res.render("admin/adminSalesReport", {
            admin: true,
            adminName: req.session.adminName,
            deliveredOrders,
            totalEarnings,
        });
    },

    adminSalesReportFilter: (req, res) => {
        req.redirect("/admin/adminSalesReport");
    },

    adminSalesReportFilterPost: async (req, res) => {
        const fromDate = req.body.fromDate;
        const toDate = req.body.toDate;

        let filteredOrders = await adminHelpers.filterDate([fromDate, toDate]);

        let totalEarnings = 0;
        if (filteredOrders.length >= 1) {
            filteredOrders.forEach((eachOrder) => {
                eachOrder.productCount = eachOrder.item.length;
                totalEarnings += eachOrder.total;

                // Date formatting
                const newDate = new Date(eachOrder.date);
                const year = newDate.getFullYear();
                const month = newDate.getMonth() + 1;
                const day = newDate.getDate();
                const formattedDate = `${day < 10 ? "0" + day : day}-${
                    month < 10 ? "0" + month : month
                }-${year}`;
                eachOrder.date = formattedDate;
            });
        } else {
            filteredOrders = false;
        }

        res.render("admin/adminSalesReport", {
            admin: true,
            adminName: req.session.adminName,
            deliveredOrders: filteredOrders,
            totalEarnings,
        });
    },

    // Admin Banner Management
    adminBanner: (req, res) => {
        adminHelpers.getBanner().then((banner) => {
            res.render("admin/adminBanner", {
                admin: true,
                adminName: req.session.adminName,
                banner,
            });
        });
    },

    adminAddBanner: async (req, res) => {
        try {
            const image = await cloudinary.uploader.upload(req.file.path);
            req.body.image = image.url;
        } catch (err) {
            console.log(err);
        }

        adminHelpers.addBanner(req.body).then(() => {
            res.redirect("back");
        });
    },

    adminEditBanner: async (req, res) => {
        const bannerId = req.params.id;
        try {
            const image = await cloudinary.uploader.upload(req.file.path);
            adminHelpers.adminBannerImageEdit(bannerId, image.url);
        } catch (err) {
            console.log(err);
        }
        adminHelpers.adminEditBanner(bannerId, req.body).then(() => {
            res.redirect("/admin/adminBanner");
        });
    },

    adminActivateBanner: (req, res) => {
        const bannerId = req.params.id;
        adminHelpers.adminActivateBanner(bannerId).then(() => {
            res.redirect("/admin/adminBanner");
        });
    },
};
