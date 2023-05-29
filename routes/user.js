var express = require('express');
var router = express.Router();
const userControllers = require('../controllers/userControllers');
const verifySession = require('../middleware/verifySession');
const userHelpers = require('../helpers/userHelpers');
const multer = require('../utils/multer');


// User Home, Login, Signup
router.get('/', verifySession.verifyUserLoggedIn,userControllers.userHome);

router.post('/Home', userControllers.userLoginPost);

router.get('/login', userControllers.userLogin);

router.get('/logout',verifySession.verifyUserLoggedIn, userControllers.logout);

router.get('/signup', userControllers.signUp);

router.post('/signup', userControllers.signUpPost);

router.get('/otpLoginPage',verifySession.ifUserLoggedIn, userControllers.otpLoginPage)

router.post('/otpLoginPagePost',verifySession.ifUserLoggedIn,userControllers.otpLoginPagePost)

router.post('/otpVarificationLogin',verifySession.ifUserLoggedIn, userControllers.otpVarificationLogin)

router.get('/forgotPass',verifySession.ifUserLoggedIn, userControllers.forgotPass)

router.post ('/forgotPasswordPost',verifySession.ifUserLoggedIn,userControllers.forgotPasswordPost);

router.post('/forgotPassOTP',verifySession.ifUserLoggedIn,userControllers.forgotPassOtpVerificaion);
// User Panel shop page
router.get('/shop',verifySession.verifyUserLoggedIn,userControllers.userStatus, userControllers.shopPage);

router.get('/product/:id',verifySession.verifyUserLoggedIn,userControllers.userStatus, userControllers.productPage);

router.get('/category/:name', verifySession.verifyUserLoggedIn, userControllers.categoryFilter);

router.post('/user/userSearchProduct', verifySession.verifyUserLoggedIn, userControllers.userSearchProduct);

// otp
router.get('/otpverification',verifySession.ifUserLoggedIn, userControllers.otpPageRender);

router.post('/otpverification', userControllers.otpVerification);

router.get('/forgotPassOTP',verifySession.ifUserLoggedIn, userControllers.forgotOtpPageRender);

router.post('/forgotPassOtpVerificaion',userControllers.forgotPassOtpVerificaion)


// User Cart
router.get('/cart/',verifySession.verifyUserLoggedIn, userControllers.userStatus,userControllers.cart);

router.get('/addToCart/:id', verifySession.verifyUserLoggedIn, userControllers.cartPage);

router.get('/deleteCart/:id', verifySession.verifyUserLoggedIn, userControllers.deleteCart);

router.post('/change-product-quantity', verifySession.verifyUserLoggedIn, userControllers.changeProductQuantity);


// User Checkout
router.get('/checkOut',verifySession.verifyUserLoggedIn, userControllers.checkOutPage);

router.post('/checkOutPost', verifySession.verifyUserLoggedIn, userControllers.checkOutPost);

router.post('/editAddressPost/:id', verifySession.verifyUserLoggedIn, userControllers.editAddressPost);

router.get('/deleteAddress/:id' , verifySession.verifyUserLoggedIn, userControllers.deleteAddress);

router.post('/placeOrder', verifySession.verifyUserLoggedIn, userControllers.placeOrder);

router.post('/verifyPayment', verifySession.verifyUserLoggedIn, userControllers.verifyPayment);


// User  Orders
router.get('/orders', verifySession.verifyUserLoggedIn,userControllers.userStatus, userControllers.orders);

router.post('/cancelOrder/:id', verifySession.verifyUserLoggedIn, userControllers.cancelOrder);

router.post('/returnOrder/:id', verifySession.verifyUserLoggedIn, userControllers.returnOrder);

router.get('/orders/viewProduct/:id', verifySession.verifyUserLoggedIn, userControllers.viewDet);

router.post('/setinvoice/:id',verifySession.verifyUserLoggedIn,userControllers.invoicegenerator) 

//Wishlist
router.get('/wishlist', verifySession.verifyUserLoggedIn,userControllers.userStatus, userControllers.wishlist);

router.get('/addToWishlist/:id', verifySession.verifyUserLoggedIn, userControllers.wishlistPage);

router.get('/deleteWishlist/:id', verifySession.verifyUserLoggedIn, userControllers.deleteWishlist);


//Filter
router.post('/shopPriceFilter', verifySession.verifyUserLoggedIn, userControllers.priceFilter);

router.post('/shopPriceSort', verifySession.verifyUserLoggedIn, userControllers.sortPrice);

router.post('/couponApply', verifySession.verifyUserLoggedIn, userControllers.couponApply);

//paypal

router.get('/success', verifySession.verifyUserLoggedIn, userControllers.paypalSuccess);
router.get('/cancel', verifySession.verifyUserLoggedIn, userControllers.failure);



//UserProfile
router.get('/userProfile', verifySession.verifyUserLoggedIn,userControllers.userStatus, userControllers.userProfile);

router.post('/userProfilePost', verifySession.verifyUserLoggedIn, userControllers.userProfilePost);

router.get('/userManageAddress', verifySession.verifyUserLoggedIn, userControllers.manageAddress);

router.get('/wallet', verifySession.verifyUserLoggedIn, userControllers.getWallet);

router.post('/uploadProfileImage', multer.single('file'), userControllers.profileImage);




module.exports = router;