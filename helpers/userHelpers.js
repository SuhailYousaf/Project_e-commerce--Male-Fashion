const bcrypt = require("bcrypt");
const collection = require("../config/collection");
const db = require("../config/connection");
const objectId = require("mongodb-legacy").ObjectId;
// const { ObjectId } = require('mongodb');

module.exports = {
    //User Signup & Login
    doSignUp: (userData) => {
        return new Promise(async (resolve, reject) => {
            const findUserExist = await db
                .get()
                .collection(collection.USER_COLLECTION)
                .findOne({ email: userData.email });
            if (!findUserExist || userData.email !== findUserExist.email) {
                Object.assign(userData, { status: true });
                userData.password = await bcrypt.hash(userData.password, 10);
                db.get()
                    .collection(collection.USER_COLLECTION)
                    .insertOne(userData)
                    .then((response) => {
                        console.log(response);
                        resolve(response);
                    })
                    .catch((err) => {
                        console.log(err);
                        reject(err);
                    });
            } else {
                resolve("Email already exist!!!");
            }
        });
    },

    doLogin: (userData) => {
        return new Promise(async (resolve, reject) => {
            const response = {};
            const user = await db
                .get()
                .collection(collection.USER_COLLECTION)
                .findOne({ email: userData.email });
            if (user) {
                bcrypt
                    .compare(userData.password, user.password)
                    .then((status) => {
                        if (status) {
                            if (user.status == true) {
                                response.user = user;
                                resolve(response);
                            } else {
                                response.status = "User Blocked!!!";
                                resolve(response);
                            }
                        } else {
                            response.status = "Invalid Password";
                            resolve(response);
                        }
                    })
                    .catch((err) => {
                        console.log(err);
                    });
            } else {
                response.status = "Invalid User";
                resolve(response);
            }
        });
    },

    verifyMobile: (mob) => {
        return new Promise(async (resolve, reject) => {
          mobExist = await db
            .get()
            .collection(collection.USER_COLLECTION)
            .findOne({ phone: mob })
            console.log(mobExist);
            let response={}
          if (mobExist) {
            if (mobExist.status === false) {
              response = "User Blocked";
              resolve(response);
            }else{
              response='user Exist'
              resolve(response)
            }
          } else {
            resolve('No user found')
          }
        })
      },

    findUserWithMob: (mob) => {
        return new Promise((resolve, reject) => {
          db.get().collection(collection.USER_COLLECTION)
            .findOne({ phone: mob })
            .then((response) => { resolve(response) })
        })
      },

    //   ===========forgotPass===============
  checkuserBlockExist:(email)=>{
    let response={}
    return new Promise(async(resolve,reject)=>{
      const user=await db.get().collection(collection.USER_COLLECTION)
      .findOne({email:email})
      if(user){
        if(user.status==false){
          response.status = "User Blocked";
          resolve(response);
        }
        console.log("insidephone");
        response.phone=user.phone

        resolve(response)
      }else{
        response.status='No user Found'
        resolve(response)
      }
    })
  },
  forgotPassUpdatePass:(userDetails)=>{
    return new Promise(async(resolve,reject)=>{
      userDetails.password = await bcrypt.hash(userDetails.password, 10);
      db .get().collection(collection.USER_COLLECTION)
      .updateOne(
        { email: userDetails.email },
        {
          $set: {
            password: userDetails.password
          }
        })
      .then(() => { resolve() })
      .catch(() => { reject() })
    })
  },
//   ====================forgotEnd=========================

    //Address
    getAddress: (userId) => {
        return new Promise(async (resolve, reject) => {
            const userAddress = await db
                .get()
                .collection(collection.USER_COLLECTION)
                .findOne({
                    _id: new objectId(userId),
                });
            try {
                const addresses = userAddress.address;
                resolve(addresses);
            } catch {
                resolve("No addresses added");
            }
        });
    },
    addAddress: (address, userId) => {
        return new Promise((resolve, reject) => {
            address.active = false;
            address.phone = Number(address.phone);
            address.postCode = Number(address.postCode);
            userId = new objectId(userId);
            // Object.assign(address, {id:uuidv4()})
            address._id = new objectId();
            db.get()
                .collection(collection.USER_COLLECTION)
                .updateOne(
                    {
                        _id: new objectId(userId),
                    },
                    {
                        $push: { address: address },
                    }
                );
        });
    },

    editAddress: (info, userId, address) => {
        return new Promise(async (resolve, reject) => {
            await db
                .get()
                .collection(collection.USER_COLLECTION)
                .updateOne(
                    {
                        _id: new objectId(userId),
                        "address._id": new objectId(address),
                    },
                    {
                        $set: {
                            "address.$.state": info.state,
                            "address.$.name": info.name,
                            "address.$.phone": Number(info.phone),
                            "address.$.address": info.address,
                            "address.$.city": info.city,
                            "address.$.postCode": info.postCode,
                            "address.$.type": info.type,
                        },
                    }
                );
        });
    },

    deleteAddress: (addressId, userId) => {
        return new Promise((resolve, reject) => {
            db.get()
                .collection(collection.USER_COLLECTION)
                .updateOne(
                    {
                        _id: new objectId(userId),
                        "address._id": new objectId(addressId), // match the address with the specified id
                    },
                    {
                        $pull: { address: { _id: new objectId(addressId) } },
                    }
                );
        });
    },

    findAddress: (addressId, userId) => {
        return new Promise(async (resolve, reject) => {
            const address = await db
                .get()
                .collection(collection.USER_COLLECTION)
                .aggregate([
                    { $match: { _id: new objectId(userId) } },
                    { $unwind: "$address" },
                    { $match: { "address._id": new objectId(addressId) } },
                    { $project: { _id: 0, address: 1 } },
                ])
                .toArray();
            resolve(address[0].address);
        });
    },

    // Orders
    getOrders: (userId) => {
        return new Promise(async (resolve, reject) => {
            userId = new objectId(userId);
            const orders = await db
                .get()
                .collection(collection.ORDER_COLLECTION)
                .find({ userId: userId })
                .sort({ date: -1 })
                .toArray();
            console.log(orders + "qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq");
            resolve(orders);
        });
    },

    addOrderDetails: (order) => {
        // Object.assign(order, {status: "pending"});
        return new Promise((resolve, reject) => {
            db.get()
                .collection(collection.ORDER_COLLECTION)
                .insertOne(order)
                .then((response) => {
                    console.log(response);
                    resolve(response);
                })
                .catch(() => {
                    reject();
                });
        });
    },

    getOrderedProducts: (ordersId) => {
        return new Promise(async (resolve, reject) => {
            ordersId = new objectId(ordersId);
            console.log(ordersId);
            const orders = await db
                .get()
                .collection(collection.ORDER_COLLECTION)
                .find({ _id: ordersId })
                .toArray();
            //                 {
            //                   '$match': {
            //                     '_id': ordersId
            //                   }
            //                 }, {
            //                   '$unwind': {
            //                     'path': '$products',
            //                     'includeArrayIndex': 'string',
            //                     'preserveNullAndEmptyArrays': true
            //                   }
            //                 }, {
            //                   '$lookup': {
            //                     'from': 'product',
            //                     'localField': 'product.productId',
            //                     'foreignField': '_id',
            //                     'as': 'productDetails'
            //                   }
            //                 }, {
            //                   '$project': {
            //                     'productDetails': 1,
            //                     '_id': 0,
            //                     'products.quantity' : 1
            //                   }
            //                 }
            //             ]).toArray();
            // console.log(orders);
            // console.log(orders[0].productDetails);
            console.log(orders);
            resolve(orders);
        });
    },

    cancelOrder: (orderId) => {
        return new Promise((resolve, reject) => {
            if (!objectId.isValid(orderId)) {
                reject(new Error("Invalid order ID"));
                return;
            }
            db.get()
                .collection(collection.ORDER_COLLECTION)
                .updateOne(
                    { _id: new objectId(orderId) },
                    { $set: { status: "Cancelled" } }
                )
                .then((response) => {
                    resolve(response);
                })
                .catch((error) => {
                    reject(error);
                });
        });
    },
};
