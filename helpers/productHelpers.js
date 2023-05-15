
var db=require('../config/connection');
var collection=require('../config/collection')
const objectId = require('mongodb-legacy').ObjectId;
const slugify = require('slugify');





module.exports={
    addProducts: (product) => {
    return new Promise((resolve, reject)=>{
        product.price = Number(product.price);
        product.stock = Number(product.stock);
        product.slug = slugify(`${product.name} ${product.category}`)
        db.get().collection(collection.PRODUCT_COLLECTION).insertOne(product).then((data) => {
            resolve(data.insertedId);
        })
    })
},



getProducts:(currentPage) => {
  return new Promise (async (resolve, reject) => {
      currentPage = parseInt(currentPage);
      console.log('currentPage');
      console.log(currentPage);
      const limit = 8;
      const skip = (currentPage-1)*limit;
      const productData = await db.get().collection(collection.PRODUCT_COLLECTION).find().skip(skip).limit(limit).toArray();
      if(productData){
          console.log("productData");
          console.log(productData);
          resolve(productData);
      }else{
          resolve("No data to show")
      }
  })
},


getProductsAdmin:(currentPage) => {
  return new Promise (async (resolve, reject) => {
    currentPage = parseInt(currentPage);
      console.log('currentPage');
      console.log(currentPage);
      const limit = 8;
      const skip = (currentPage-1)*limit;
      const productData = await db.get().collection(collection.PRODUCT_COLLECTION).find().skip(skip).limit(limit).toArray();
      // const productData = await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray();
      if(productData){
          resolve(productData);
      }else{
          resolve("No data to show")
      }
  })
},

  getSingleProduct: (slug) => {
    return new Promise (async (resolve, reject) =>{
        const productSingleData = await db.get().collection(collection.PRODUCT_COLLECTION).findOne(
            {
               slug:slug
            })
            .then((productSingleData)=>{resolve(productSingleData)})
            // console.log(productSingleData);
            // resolve(productSingleData);
        })
},

editProduct: (productId, data) => {
    return new Promise ((resolve , reject) => {
        console.log(data)
        productId = new objectId (productId)
         db.get().collection(collection.PRODUCT_COLLECTION)
         .updateOne(
            {
                _id: productId
            },
            {
                $set: {
                    name: data.name,
                    category: data.category,
                    description: data.description,
                    price: Number(data.price),
                    slug : slugify(`${data.name} ${data.category}`),
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
    return new Promise ((resolve, reject) => {
        db.get().collection(collection.PRODUCT_COLLECTION).deleteOne(
            {
                _id: new objectId(productId)
            }
        )
        .then((response) => {
            console.log(response);
            resolve()
        })
        .catch((err) => {
            console.log(err);
            reject()
        })
    })
},

deleteCategoryProducts: (category) => {
  console.log("delete cheyyaan vannittundeee")
  return new Promise((resolve, reject) => {
    db.get().collection(collection.PRODUCT_COLLECTION).deleteMany(
      { category: category }
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



//Product Image
addProductImage:(id, imgUrls)=>{
    return new Promise((resolve, reject)=>{
        console.log("helpers")
        db.get().collection(collection.PRODUCT_COLLECTION)
        .updateOne(
            {
                _id: new objectId(id)
            },
            {
                $set:{
                    images: imgUrls
                }
            }
        )
        .then((response)=>{
            console.log(response);
            resolve();
        })
        .catch((err)=>{
            console.log(err);
            reject()
        })
    })
},

editProductImage: (id, imgUrls) => {
    return new Promise ((resolve , reject) => {
        db.get().collection(collection.PRODUCT_COLLECTION)
        .updateOne(
            {
                _id: new objectId(id)
            },
            {
                $set: {
                    images: imgUrls
                }
            }
        ).then((response) => {
            console.log(response);
            resolve()
        }).catch((err) => {
            console.log(err);
            reject()
        })
    })
},

// getListedCategory:()=>{
//     return new Promise(async(resolve, reject)=>{
//         const categories = await db.get().collection(collection.CATEGORY_COLLECTION).find(
//             {
//                 listed : true
//             }
//         ).toArray();
//         console.log(categories);
//         resolve(categories);
//     })
// },

//sort filter search

getListedCategory:()=>{
  return new Promise(async(resolve, reject)=>{
      const categories = await db.get().collection(collection.CATEGORY_COLLECTION).find(
          {
              listed : true
          }
      ).toArray();
      console.log(categories);
      resolve(categories);
  })
},

filterPrice: (minPrice, maxPrice, Category) => {
    return new Promise(async (resolve, reject) => {
      let filteredProducts;
      if (Category) {
        filteredProducts = await db.get().collection(collection.PRODUCT_COLLECTION).aggregate([
          {
            $lookup: {
              from: 'category',
              localField: 'category',
              foreignField: 'name',
              as: 'result'
            }
          },
          {
            $match: {
              category: Category
            }
          },
          {
            $match: {
              price: {
                $gte: parseInt(minPrice),
                $lte: parseInt(maxPrice)
              }
            }
          }
        ]).toArray();
      } else {
        filteredProducts = await db.get().collection(collection.PRODUCT_COLLECTION).find({
          price: {
            $gte: parseInt(minPrice),
            $lte: parseInt(maxPrice)
          }
        }).toArray();
      }
      resolve(filteredProducts);
    })
  },


sortPrice:(detailes, category) => {
  console.log("details")
    console.log(detailes)
    return new Promise (async (resolve, reject) => {
    try{
        const minPrice = Number(detailes.minPrice);
        const maxPrice = Number(detailes.maxPrice);
        const value = detailes.sort
        console.log("value"+value)
        let product;

        if(category){
            product = await db.get().collection(collection.PRODUCT_COLLECTION).aggregate([
                {
                  $lookup: {
                    from: 'category',
                    localField: 'category',
                    foreignField: 'name',
                    as: 'result'
                  }
                },
                {
                  $match: {
                    category: category
                  }
                },
                {
                  $match: {
                    price: {
                      $gte: parseInt(minPrice),
                      $lte: parseInt(maxPrice)
                    }
                  }
                }
              ]).sort({price: value}).toArray();

        }else{
            product = await db.get().collection(collection.PRODUCT_COLLECTION).find({
                price: {
                    $gte: parseInt(minPrice),
                    $lte: parseInt(maxPrice)
                  }
            }).sort({price: value}).toArray();
        }
        resolve(product);
        console.log(product)
         
    }catch{
        console.log("Error");
    }
        
    });
  },

  totalPages:()=> {
    return new Promise(async (resolve, reject) => {
        const totalCount = await db.get().collection(collection.PRODUCT_COLLECTION).countDocuments({});
        console.log(totalCount+"totalcoounts inside")
        resolve(totalCount);
    })
  },

  totalOrdersPlaced:() => {
    return new Promise (async (resolve, reject) => {
        try{
            const orderPlacedCount = await db.get().collection(collection.ORDER_COLLECTION).countDocuments({});
            resolve(orderPlacedCount);
        }catch{
            resolve(0)
        }
    })
  },

  userSearchProduct:(serach)=> {
    return new Promise ( async (resolve, reject) => {
        await db.get().collection(collection.PRODUCT_COLLECTION).find(
            {
                name:{$regex: new RegExp(serach), $options:"i"}
            }
        ).toArray()
        .then((productData) => {
            resolve(productData);
        }).catch((err) => {
            reject(err);
        })
    })
  }
  
}