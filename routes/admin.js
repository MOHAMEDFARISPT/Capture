var express = require('express');
var router = express.Router();
var admin = require('../controller/admincontroller');
var categorycontroller = require('../controller/category');
var productcontroller=require('../controller/productcontroller')
const salesreport=require('../controller/salesreportcontroller')
const multer = require('multer');
const path = require('path');
const isAdmin = require('../middlewares/adminauth');
const backtologin=require('../middlewares/adminauth')

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

router.get("/adminlogin", admin.adminlogin);
router.get("/", admin.home);
router.post("/loginpost", admin.loginpost);
router.get("/alluser", admin.listusers);


router.get("/Products", productcontroller.productlist);
router.get("/addproducts",productcontroller.addproduct);
router.post("/addproduct",upload.array('productImage',5),productcontroller.formad)
router.post('/unlistproducts/:productid',productcontroller.unlistproducts)
router.get('/Editproducts',productcontroller.Editproduct)
router.post('/editpost/:Id',upload.array('productImage'),productcontroller.Editproductpost)

router.get("/addcategory", categorycontroller.adcategory);
router.post('/blockUser/:userId', admin.blockUser);
router.post('/categoryad', upload.single('categoryImage'), categorycontroller.addcategory);
router.get('/category',categorycontroller.listcategery)
router.post('/unlistcategory/:categoryid',categorycontroller.unlistcategory)
router.get('/Editcategory',categorycontroller.Editcategory)
router.post('/Editcategory/:Id',upload.single('categoryImage'),categorycontroller.Editcategorypost)

router.get("/orderlist",admin.listorders)
router.get("/orderdetailes/:orderId",admin.orderdetailes)


 //CHANGE ORDER STATUS

 router.post('/update-order-status',admin.changeorderstatus)

 //coupons

 router.get("/coupons",admin.coupons)
 router.get('/add-coupons',admin.addcoupons)
 
//coupon form post
router.post('/coupons/create-coupon',admin.postcoupon)
 // Example route definition
router.delete('/coupons/:couponId', admin.coupondelete);
router.get('/editcoupon',admin.editcoupon)
router.post('/editcouponpost/:couponId',admin.editcouponpost)

//list/inlistcoupon
router.post("/listuser/:couponid",admin.listCoupon)

//remove image

router.post("/removeImage",productcontroller.removeImage)

//logout
router.get("/adminlogout",admin.logout)


 //daily sales reports
 router.get("/dailyreports",salesreport.dailysalesreports)

 router.get('/monthlyreport',salesreport.monthlyreport)

 router.get('/yearlyreports',salesreport.yearlysalesreport)

 //salesrepport print
 router.post('/printReport',salesreport.printReport)

 router.get('/change-password',admin.changepassword)
 router.post('/change-password-post',admin.changepasspost)

 





module.exports = router;
