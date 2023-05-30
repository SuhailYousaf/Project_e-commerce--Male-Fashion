const express = require('express');
const router = express.Router();
const adminControllers = require('../controllers/adminControllers');
const upload = require('../utils/multer');
const userControllers = require('../controllers/userControllers');
const verifySession = require('../middleware/verifySession');
const multer = require('../utils/multer');

router.get('/', verifySession.ifAdminLoggedIn, adminControllers.adminLogin);
router.get('/AdminLogout', verifySession.verifyAdminLoggedIn, adminControllers.adminLogout);
// Admin Panel
router.get('/adminPanel', verifySession.verifyAdminLoggedIn, adminControllers.adminPanel);
router.post('/adminPanel', adminControllers.adminLoginPost); 
// Admin Users
router.get('/adminUserManagement',  verifySession.verifyAdminLoggedIn, adminControllers.adminUserManagement);
router.get('/addUser',  verifySession.verifyAdminLoggedIn, adminControllers.adminAddUser);
router.post('/addUser', adminControllers.adminAddUserPost);
router.post('/editUser/:id', adminControllers.adminEditUser);
router.get('/deleteUser/:id', adminControllers.adminDeleteUser);
router.get('/adminBlockUser/:id', adminControllers.adminBlockUser);
router.post('/suser',   adminControllers.adminsearchuser);
// Admin Products
router.get('/adminProduct', verifySession.verifyAdminLoggedIn, adminControllers.adminProduct);
router.get('/adminAddProduct', verifySession.verifyAdminLoggedIn, adminControllers.adminAddProduct);
router.post('/adminAddProduct',upload.array('image'), adminControllers.adminAddProductPost);
router.post('/adminEditProduct/:id',upload.array('image'), adminControllers.adminEditProduct);
router.get('/adminDeleteProduct/:id', adminControllers.adminDeleteProduct);
router.post('/adminSearchProduct', verifySession.verifyAdminLoggedIn, adminControllers.adminSearchProduct);
// Admin Category
router.get('/adminCategory', verifySession.verifyAdminLoggedIn, adminControllers.getCategory);
router.post('/adminCategory', adminControllers.addCategory);
router.get('/adminDeleteCategory/:id/:name', adminControllers.deleteCategory);
// Admin Order
router.get('/adminOrder', verifySession.verifyAdminLoggedIn, adminControllers.adminOrder);
router.post('/adminOrderStatus/:id', verifySession.verifyAdminLoggedIn, adminControllers.adminOrderStatus);
router.get('/adminOrdersView/:id', verifySession.verifyAdminLoggedIn, adminControllers.adminOrderView);
router.post('/adminRefund/:id', verifySession.verifyAdminLoggedIn, adminControllers.adminRefund);
//view details
router.get('/viewProducts/:id',verifySession.verifyAdminLoggedIn,adminControllers.viewDetails);
//admin coupon
router.get('/adminCoupon', verifySession.verifyAdminLoggedIn, adminControllers.adminCoupon);
router.post('/adminAddCoupon', verifySession.verifyAdminLoggedIn, adminControllers.adminAddCoupon);
router.post('/adminEditCoupon/:id', verifySession.verifyAdminLoggedIn, adminControllers.adminEditCoupon);
router.get('/adminDeactivate/:id', verifySession.verifyAdminLoggedIn, adminControllers.adminDeactivate);
router.get('/adminActivate/:id', verifySession.verifyAdminLoggedIn, adminControllers.adminActivate);
//admin salesReport
router.get('/adminSalesReport', verifySession.verifyAdminLoggedIn, adminControllers.adminSalesReport);
router.get('/adminSalesReportFilter', verifySession.verifyAdminLoggedIn, adminControllers.adminSalesReportFilter);
router.post('/adminSalesReportFilter', verifySession.verifyAdminLoggedIn, adminControllers.adminSalesReportFilterPost);
// Admin Banner
router.get('/adminBanner', verifySession.verifyAdminLoggedIn, adminControllers.adminBanner);
router.post('/adminAddBanner', verifySession.verifyAdminLoggedIn, multer.single("image", 1), adminControllers.adminAddBanner);
router.post('/adminEditBanner/:id', verifySession.verifyAdminLoggedIn, multer.single("image", 1), adminControllers.adminEditBanner);
router.get('/adminActivateBanner/:id', verifySession.verifyAdminLoggedIn, adminControllers.adminActivateBanner);
module.exports = router;