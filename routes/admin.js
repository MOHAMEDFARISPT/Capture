var express = require('express');
var router = express.Router();
var admin = require('../controller/admincontroller');
var categorycontroller = require('../controller/category');
var productcontroller=require('../controller/productcontroller')
const salesreport=require('../controller/salesreportcontroller')
const multer = require('multer');
const path = require('path');
const {isAdmin ,backtologin}=require('../middlewares/adminauth')

// Multer configuration for handling file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/imagesmulter');
  },
  filename: (req, file, cb) => {
    console.log(file);
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
   storage: storage,
  limits:{
    fileSize: 1024 * 1024 * 5, 
  } 
  });

router.get("/adminlogin",backtologin, admin.adminlogin);

router.post("/loginpost", admin.loginpost);
router.get("/adminpanel",isAdmin, admin.home);
router.get("/alluser",isAdmin, admin.listusers);


router.get("/Products-admin",isAdmin, productcontroller.productlist);
router.get("/addproducts",isAdmin,productcontroller.addproduct);
router.post("/addproduct",isAdmin,upload.array('productImage',5),productcontroller.formad)
router.post('/unlistproducts/:productid',isAdmin,productcontroller.unlistproducts)
router.get('/Editproducts',isAdmin,productcontroller.Editproduct)
router.post('/editpost/:Id',isAdmin,upload.array('productImage'),productcontroller.Editproductpost)

router.get("/addcategory",isAdmin, categorycontroller.adcategory);
router.post('/blockUser/:userId',isAdmin, admin.blockUser);
router.post('/categoryad',isAdmin, upload.single('categoryImage'), categorycontroller.addcategory);
router.get('/category',isAdmin,categorycontroller.listcategery)
router.post('/unlistcategory/:categoryid',isAdmin,categorycontroller.unlistcategory)
router.get('/Editcategory',isAdmin,categorycontroller.Editcategory)
router.post('/Editcategory/:Id',isAdmin,upload.single('categoryImage'),categorycontroller.Editcategorypost)

router.get("/orderlist",isAdmin,admin.listorders)
router.get("/orderdetailes/:orderId",isAdmin,admin.orderdetailes)



 //CHANGE ORDER STATUS

 router.post('/update-order-status',isAdmin,admin.changeorderstatus)

 //coupons

 router.get("/coupons",isAdmin,admin.coupons)
 router.get('/add-coupons',isAdmin,admin.addcoupons)
 
//coupon form post
router.post('/coupons/create-coupon',isAdmin,admin.postcoupon)
 // Example route definition
router.delete('/coupons/:couponId',isAdmin, admin.coupondelete);
router.get('/editcoupon',isAdmin,admin.editcoupon)
router.post('/editcouponpost/:couponId',isAdmin,admin.editcouponpost)

//list/inlistcoupon
router.post("/listuser/:couponid",isAdmin,admin.listCoupon)

//remove image

router.post("/removeImage",isAdmin,productcontroller.removeImage)

//logout
router.get("/adminlogout",isAdmin,isAdmin,admin.logout)


 //daily sales reports
 router.get("/dailyreports",isAdmin,salesreport.dailysalesreports)

 router.get('/monthlyreport',isAdmin,salesreport.monthlyreport)

 router.get('/yearlyreports',isAdmin,salesreport.yearlysalesreport)

 //salesrepport print
 router.post('/printReport',isAdmin,salesreport.printReport)

 router.get('/change-password',isAdmin,admin.changepassword)
 router.post('/change-password-post',isAdmin,admin.changepasspost)

 





module.exports = router;
