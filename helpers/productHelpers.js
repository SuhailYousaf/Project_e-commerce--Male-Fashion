var db = require("../config/connection");
var collection = require("../config/collection");
const objectId = require("mongodb-legacy").ObjectId;
const slugify = require("slugify");
module.exports = {
    addProducts: (product) => {
        return new Promise((resolve, reject) => {
            product.price = Number(product.price);
            product.stock = Number(product.stock);
            product.slug = slugify(`${product.name} ${product.category}`);
            if (product.price <= 0 || product.stock <= 0) {
                resolve();
            } else {
                db.get()
                    .collection(collection.PRODUCT_COLLECTION)
                    .insertOne(product)
                    .then((data) => {
                        db.get()
                            .collection(collection.PRODUCT_COLLECTION)
                            .updateOne(
                                {
                                    _id: new objectId(data.insertedId),
                                },
                                {
                                    $set: {
                                        listed: true,
                                    },
                                }
                            );
                        resolve(data.insertedId);
                    });
            }
        });
    },
    getSomeProducts: () => {
        return new Promise(async (resolve, reject) => {
            const someProduct = await db
                .get()
                .collection(collection.PRODUCT_COLLECTION)
                .find()
                .limit(8)
                .toArray();
            if (someProduct) {
                resolve(someProduct);
            } else {
                resolve("No data found");
            }
        });
    },
    getProducts: (currentPage) => {
        return new Promise(async (resolve, reject) => {
            currentPage = parseInt(currentPage);
            const limit = 8;
            const skip = (currentPage - 1) * limit;
            const productData = await db
                .get()
                .collection(collection.PRODUCT_COLLECTION)
                .find({
                    listed: true,
                })
                .skip(skip)
                .limit(limit)
                .toArray();
            if (productData) {
                resolve(productData);
            } else {
                resolve("No data to show");
            }
        });
    },
    getProductsAdmin: (currentPage) => {
        return new Promise(async (resolve, reject) => {
            currentPage = parseInt(currentPage);
            const limit = 8;
            const skip = (currentPage - 1) * limit;
            const productData = await db
                .get()
                .collection(collection.PRODUCT_COLLECTION)
                .find({
                    listed: true,
                })
                .skip(skip)
                .limit(limit)
                .toArray();
            if (productData) {
                resolve(productData);
            } else {
                resolve("No data to show");
            }
        });
    },
    getSingleProduct: (slug) => {
        return new Promise(async (resolve, reject) => {
            const productSingleData = await db
                .get()
                .collection(collection.PRODUCT_COLLECTION)
                .findOne({
                    slug: slug,
                })
                .then((productSingleData) => {
                    resolve(productSingleData);
                });
        });
    },
    editProduct: (productId, data) => {
        return new Promise((resolve, reject) => {
          console.log(data)
          productId = new objectId(productId)
          db.get().collection(collection.PRODUCT_COLLECTION)
            .updateOne(
              {
                _id: productId
              },
              {
                $set: {
                  name: data.name,
                  productid:data.productid,
                  category: data.category,
                  description: data.description,
                  price: Number(data.price),
                  slug: slugify(`${data.name} ${data.category}`),
                  stock: Number(data.stock),
    
                }
              }
            ).then((response) => {
              console.log(response);
              resolve()
            }).catch((err) => {
              console.log(err);
              reject();
            })
        })
      },
    deleteProducts: (productId) => {
        return new Promise((resolve, reject) => {
            db.get()
                .collection(collection.PRODUCT_COLLECTION)
                .deleteOne({
                    _id: new objectId(productId),
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
    deleteCategoryProducts: (category) => {
        return new Promise((resolve, reject) => {
            db.get()
                .collection(collection.PRODUCT_COLLECTION)
                .deleteMany({ category: category })
                .then((response) => {
                    resolve();
                })
                .catch((err) => {
                    reject(err);
                });
        });
    },
    getRelatedProducts: (category) => {
        return new Promise(async (resolve, reject) => {
            const getRelatedProduct = await db
                .get()
                .collection(collection.PRODUCT_COLLECTION)
                .find({
                    category: category,
                })
                .limit(4)
                .toArray();
            if (getRelatedProduct) {
                resolve(getRelatedProduct);
            } else {
                resolve("No data Found");
            }
        });
    },
    //Product Image
    addProductImage: (id, imgUrls) => {
        return new Promise((resolve, reject) => {
            db.get()
                .collection(collection.PRODUCT_COLLECTION)
                .updateOne(
                    {
                        _id: new objectId(id),
                    },
                    {
                        $set: {
                            images: imgUrls,
                        },
                    }
                )
                .then((response) => {
                    console.log(response);
                    resolve();
                })
                .catch((err) => {
                    console.log(err);
                    reject();
                });
        });
    },
    editProductImage: (id, imgUrls) => {
        return new Promise((resolve, reject) => {
            db.get()
                .collection(collection.PRODUCT_COLLECTION)
                .updateOne(
                    {
                        _id: new objectId(id),
                    },
                    {
                        $set: {
                            images: imgUrls,
                        },
                    }
                )
                .then((response) => {
                    resolve();
                })
                .catch((err) => {
                    reject();
                });
        });
    },
    //sort filter search
    getListedCategory: () => {
        return new Promise(async (resolve, reject) => {
            const categories = await db
                .get()
                .collection(collection.CATEGORY_COLLECTION)
                .find({
                    listed: true,
                })
                .toArray();
            resolve(categories);
        });
    },
    filterPrice: (minPrice, maxPrice, Category) => {
        return new Promise(async (resolve, reject) => {
            let filteredProducts;
            if (Category) {
                filteredProducts = await db
                    .get()
                    .collection(collection.PRODUCT_COLLECTION)
                    .aggregate([
                        {
                            $lookup: {
                                from: "category",
                                localField: "category",
                                foreignField: "name",
                                as: "result",
                            },
                        },
                        {
                            $match: {
                                category: Category,
                            },
                        },
                        {
                            $match: {
                                price: {
                                    $gte: parseInt(minPrice),
                                    $lte: parseInt(maxPrice),
                                },
                            },
                        },
                    ])
                    .toArray();
            } else {
                filteredProducts = await db
                    .get()
                    .collection(collection.PRODUCT_COLLECTION)
                    .find({
                        price: {
                            $gte: parseInt(minPrice),
                            $lte: parseInt(maxPrice),
                        },
                    })
                    .toArray();
            }
            resolve(filteredProducts);
        });
    },
    sortPrice: (detailes, category) => {
        return new Promise(async (resolve, reject) => {
            try {
                const minPrice = Number(detailes.minPrice);
                const maxPrice = Number(detailes.maxPrice);
                const value = detailes.sort;
                let product;
                if (category) {
                    product = await db
                        .get()
                        .collection(collection.PRODUCT_COLLECTION)
                        .aggregate([
                            {
                                $lookup: {
                                    from: "category",
                                    localField: "category",
                                    foreignField: "name",
                                    as: "result",
                                },
                            },
                            {
                                $match: {
                                    category: category,
                                },
                            },
                            {
                                $match: {
                                    price: {
                                        $gte: parseInt(minPrice),
                                        $lte: parseInt(maxPrice),
                                    },
                                },
                            },
                        ])
                        .sort({ price: value })
                        .toArray();
                } else {
                    product = await db
                        .get()
                        .collection(collection.PRODUCT_COLLECTION)
                        .find({
                            price: {
                                $gte: parseInt(minPrice),
                                $lte: parseInt(maxPrice),
                            },
                        })
                        .sort({ price: value })
                        .toArray();
                }
                resolve(product);
            } catch {
                reject(err)
            }
        });
    },
    totalPages: () => {
        return new Promise(async (resolve, reject) => {
          try {
            const totalCount = await db
              .get()
              .collection(collection.PRODUCT_COLLECTION)
              .countDocuments({});
            resolve(totalCount);
          } catch (error) {
            reject(error);
          }
        });
      },   
    totalOrdersPlaced: () => {
        return new Promise(async (resolve, reject) => {
            try {
                const orderPlacedCount = await db
                    .get()
                    .collection(collection.ORDER_COLLECTION)
                    .countDocuments({});
                resolve(orderPlacedCount);
            } catch {
                resolve(0);
            }
        });
    },
    userSearchProduct: (serach) => {
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
};