var express = require('express');
var router = express.Router();
var user=require('../controller/usercontroller')
const session=require('express-session')
 const userprofilecontroller=require('../controller/userprofilecontroller')
 const cartcontroller=require("../controller/cartcontroller")
 const {isblocked}=require('../middlewares/checkisblocked')
 const {checkingsession,backtologin}=require("../middlewares/isauthenticated")

 const checkout=require("../controller/chekoutcontroller")
 const wishlist=require("../controller/wishlistcontroller")
  const wallet=require("../controller/walletcontroller")



//api
router.get("/",user.home)

/*USER LOGIN*/ 
router.get("/login",backtologin,user.login)


router.get("/signup",user.signup)
router.get("/otp",user.otp)
router.post("/signup",user.signuppost)
router.post("/otp",user.otpverification)
router.post("/resendotp",user.resendotp)
router.post("/login",user.loginpost)
router.get("/forgetpass",user.forgetpass)

router.post('/forgetpass',user.forgotpass)
router.get("/forgetpass",user.resetpass)


router.get('/reset-password',user.resetpassword);
    
router.post('/reset-password',user.resetPasswordPost)



// product page
router.get('/products',checkingsession,isblocked,user.product)

//products page
router.get('/category',user.category)

//userprofile
router.get("/account",checkingsession,isblocked,userprofilecontroller.account)

//edit Account

router.post('/Edit-accounts/:id',userprofilecontroller.editaccountpost)


//addaddressget
router.get("/Add-address",checkingsession,isblocked,userprofilecontroller.addaddress)
//addaddresspost
 router.post("/adaddress",checkingsession,isblocked,userprofilecontroller.addresspost)
//Edit Addressget
router.get('/edit-address/:addressId',checkingsession,isblocked,userprofilecontroller.EditAddress)
//Edit Addresspost
router.post('/update-address/:addressId',checkingsession,isblocked,userprofilecontroller.updateAddress)

//cart 
router.get("/cart",checkingsession,isblocked,cartcontroller.cart)



//coupon apply

router.post("/couponapply/:couponId",checkingsession,isblocked,cartcontroller.couponapply)

//remove coupon
router.post('/cart/remove-coupon/:userId',checkingsession,isblocked,cartcontroller. removeCoupon);

 //Add to Cart
 router.post("/cartpost/:productId",checkingsession,isblocked,cartcontroller.cartpost)

 //updatequantity
 router.post('/quantity-update',checkingsession,isblocked, cartcontroller.updateQuantity);

 //logout
 router.get("/logout",userprofilecontroller.logout)

 //cart item delete
 router.delete('/item-delete/:productId', cartcontroller.Cartiteamdelete);

 //getcheckout
 router.get("/checkout",checkingsession,isblocked,checkout.checkoutget)

 //add-address in checkout
 router.post("/add-address-chkout",checkingsession,isblocked,checkout.addaddress)

 //edit address in chekout
 router.get('/edit-address-chekout/:addressId',checkingsession,isblocked,userprofilecontroller.editaddresschekout)
 //edit address in chekout post
 router.post('/editaddresspost-chekout/:addressId',checkingsession,isblocked,userprofilecontroller.chekouteditaddresspost)

 
 //delete address
 router.delete('/delete-address/:addressId',checkingsession,isblocked,checkout.deleteaddress)


//change password
router.post("/change-password",checkingsession,isblocked,userprofilecontroller.changepassword)


 //selection

 router.post("/productselection/:productId",checkout.selectionbox)

//refereal code confirm in sugnup form

router.post('/validate-referral-code',user.validaterefferalcode)
 //payment method

 router.post("/place-order",checkingsession,isblocked,checkout.addresspaymentmethod)

 //razerpay verify
 router.post('/rzrpay-verify:razorpayOrderId',checkingsession,isblocked,checkout.verifyrazerpay)

//success page
 router.get('/success/:orderId',checkingsession,isblocked,user.success)

 //generate invoice
 router.get('/generate-invoice/:orderId', checkingsession, isblocked, user.invoice);
 

//order detailes
 router.get('/orderdetails/:orderId',checkingsession,isblocked,userprofilecontroller.myorderdetailes)

 //cancel order
 router.post('/cancel-order',checkingsession,isblocked,userprofilecontroller.cancelOrder);

 //return order
 router.post('/returnProduct',checkingsession,isblocked,userprofilecontroller.returnproduct)

 //wishlist
 router.get('/wishlist',checkingsession,isblocked,wishlist.wishlist)
 router.post('/wishlist',checkingsession,isblocked,wishlist.addtowishlist)
 router.delete('/wishlist/remove-item/:id',checkingsession,isblocked,wishlist.removewishlist)



 



 //add amount to wallet using razorepay
 router.post('/addamounttowallet',checkingsession,isblocked,wallet.addwalletamount)
 //veriffication razorepay add amount to wallet
 router.post('/rzrpay-verify',checkingsession,isblocked,wallet.verifyrazorpay)






























module.exports = router;
