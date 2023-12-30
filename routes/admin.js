var express = require('express');
var router = express.Router();
var admin = require('../controller/admincontroller');
var categorycontroller = require('../controller/category');
var productcontroller=require('../controller/productcontroller')
const multer = require('multer');
const path = require('path');

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

//remove image

router.post("/removeImage",productcontroller.removeImage)

//logout
router.get("/adminlogout",admin.logout)




module.exports = router;
