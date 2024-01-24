const express=require("express")
const usermodel=require("../model/userschema")
const productcontroller=require('../model/productschema')
const usercontroller=require('../controller/usercontroller')
const router=express.Router()
const addressmodel=require('../model/addressschema')
const cartModel = require("../model/cartschema")
const ordermodel=require("../model/orderschema")
const productmodel=require('../model/productschema')
const bcrypt = require('bcrypt');
const Wallet=require('../model/walletschema')

const account = async (req, res,next) => {

  try {

    let userloggedin = false;
  if(req.session && req.session.userdata){
    userloggedin=true;
  }
    const data = req.session.userdata;
    const address = await addressmodel.findOne({ user: req.session.userdata });
    console.log("//////Address"+address);
    // Check if 'address' is null or undefined
    if (!address) {
      // Handle the case where no address is found
      console.log("No address found for the user.");
     
    }


    const page = parseInt(req.query.page) || 1;
    const limit = 5; // Set the number of orders per page

    // Calculate the skip value based on the page and limit
    const skip = (page - 1) * limit;

    // Find total count of orders (without retrieving documents)
    const totalCount = await ordermodel.countDocuments({ userId: data._id });

    // Calculate total pages
    const totalPages = Math.ceil(totalCount / limit);
    const orders=await  ordermodel.find({userId:data._id}).populate("products.productId").sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);
    console.log("//////////orders//////////////"+orders);


    const wallet=await Wallet.findOne({user:data._id})
    console.log("wallet",wallet)

    
    res.render('user/dashboard',{wallet,orders,data, address,userloggedin ,totalPages,page});
  } catch (error) {
    // Handle any errors that occurred during the process
    console.error("Error in the 'account' controller:", error);
    next(error)
    // res.status(500).send("Internal Server Error");
  }
};

const editaccountpost=async(req,res)=>{
  console.log("////////////////////")
    console.log("params",req.params.id)

    const user=await usermodel.findOne({_id:req.params.id})
   
    if(user){
  
     
    user.firstname=req.body.firstname ||  user.firstname
    user.lastname=req.body.lastname || user.lastname
    user.contact=req.body.contact ||  user.contact
   user.email=req.body.email  || user.email
    
    
  
     await user.save()
     console.log("user detailes changed");
     res.redirect("/account")
   
    
  
  
    }else{
      console.error(err)
    }


}

const addaddress=(req,res)=>{
  res.render("user/adaddress")
}




const addresspost = async (req, res,next) => {
  console.log("session data"+req.session.userdata);
  const { fullname, contact, pincode, state, address, locality, district } = req.body;

  const newaddress = {
    fullname,
    contact,
    pincode,
    state,
    address,
    locality,
    district
  };
  console.log("session",req.session.userdata)

  console.log(newaddress);

  try {
    const existingAddress = await addressmodel.findOne({ user: req.session.userdata._id });

    if (existingAddress) {
      const addressexist = existingAddress.addresses.some(addr => (
        addr.fullname == fullname &&
        addr.contact == contact &&
        addr.pincode == pincode &&
        addr.state == state &&
        addr.address == address &&
        addr.locality == locality &&
        addr.district == district  // Fix the typo here
      ));

      if (addressexist) {
        return res.status(400).json({ message: 'Address already exists' });
      }

      existingAddress.addresses.push(newaddress);
      await existingAddress.save();
    } else {
      console.log("id"+req.session.userdata._id);
      const newentry = new addressmodel({ user: req.session.userdata._id, addresses: [newaddress] });
      console.log("new wntryyy"+newentry);
      await newentry.save();
  // Redirect after sending JSON response
    }
    

    res.redirect("/account"); 
    
  } catch (error) {
    console.error(error);
    next(error)
  }
};



const EditAddress = async (req, res) => {
  try {
      const addressId = req.params.addressId;
      const userId = req.session.userdata._id;
      
      const user = await usermodel.findOne({ _id: userId });
      console.log("userrrrrrrr", user);

      if (user) {
          const Address = await addressmodel.findOne({ user: userId });
          
          if (Address) {
              const matchingAddress = Address.addresses.find(addr => addr._id.toString() === addressId);
              console.log(matchingAddress);
              res.render("user/EditAddress", { Address: matchingAddress });
          } else {
              console.log("Address not found");
          }
      } else {
          console.log("User not found");
      }
  } catch (error) {
      console.log(error);
  }
};


const updateAddress = async (req, res) => {
  try {
    const addressId = req.params.addressId;

    const formdatas = {
      fullname: req.body.fullname,
      contact: req.body.contact,
      pincode: req.body.pincode,
      state: req.body.state,
      address: req.body.address,
      locality: req.body.locality,
      district: req.body.district,
    };

    const updatedAddress = await addressmodel.findOneAndUpdate(
      { 'addresses._id': addressId },
      { $set: { 'addresses.$': formdatas } },
      { new: true }
    );

    res.redirect("/account");
  } catch (error) {
    console.error(error);
  }
};






// const cancelOrder=async(req,res)=>{
  
//   const orderId=req.body.orderId;
//   const productId=req.body.productId
//   const reason=req.body.reason
//   console.log("reason"+reason)
//   console.log(orderId);
//   console.log(productId);
  
//   const orderproduct=await ordermodel.findById(orderId).populate('products.productId')
// if(!orderproduct){
//   return res.status(404).json({message:'order not found'})

// }
//     const matchedproduct = orderproduct.products.find(prdct => prdct.productId._id.toString() === productId);
//    if(!matchedproduct){
//     return res.status(404).json({message:'Product is not found'})
//    }
//    const product=await productmodel.findById(productId);
// if(!product){
//   return res.status(404).json({ message: 'Product not found in the database' });
// }
// product.quantity +=matchedproduct.quantity
// await product.save()
// matchedproduct.reason='reason';
  
// matchedproduct.cancelstatus = 'canceled';

//     await orderproduct.save()
//     console.log("product cancelled")
//     res.status(200).json({message:'product cancelled!!'})
//   }
 
const cancelOrder = async (req, res) => {
  try {
      const { orderId, productId, reason } = req.body;

      const orderProduct = await ordermodel.findById(orderId).populate('products.productId');

      if (!orderProduct) {
          return res.status(404).json({ message: 'Order not found' });
      }

      const matchedProduct = orderProduct.products.find(prdct => prdct.productId._id.toString() === productId);

      if (!matchedProduct) {
          return res.status(404).json({ message: 'Product is not found' });
      }

      const product = await productmodel.findById(productId);

      if (!product) {
          return res.status(404).json({ message: 'Product not found in the database' });
      }

      product.quantity += matchedProduct.quantity;

      const userWallet = await Wallet.findOne({ user: orderProduct.userId });
      console.log("ORDERPRODUCT",orderProduct)
      console.log("userWallet",userWallet);
      if (orderProduct.paymentMethod === 'wallet' || orderProduct.paymentMethod === 'razorpay') {
        // Add the cancelled amount back to the wallet balance
        userWallet.balance += matchedProduct.total;

        // Add a transaction record to the wallet's transactions array
        userWallet.transactions.push({
            amount: matchedProduct.total,
            type: 'credit',
            description: `Refund for cancelled product - ${matchedProduct.productId.productname}`,
        });

        // Save the wallet changes
        await userWallet.save();
    }


      // Save the cancellation reason in the database
      matchedProduct.reason = reason; // Update this line to save the provided reason
      matchedProduct.cancelstatus = 'canceled';

      await product.save();
      await orderProduct.save();

      console.log('Product canceled');
      res.status(200).json({ message: 'Product canceled!!', orderProduct });

  } catch (error) {
      console.error('Error cancelling order:', error);
      res.status(500).json({ message: 'Internal server error' });
  }
};





const returnproduct = async (req, res, next) => {
  try {
    console.log("req.body", req.body);
    const orderId = req.body.orderId;
    const productId = req.body.productId;
    const reason = req.body.reason;
    const userId= req.session.userdata._id;
    console.log("orderId", orderId, "productId", productId, "reason", reason);

    // Find the order
    const findorder = await ordermodel.findById(orderId).populate('products.productId');
    console.log("findorder",findorder)

    if (!findorder) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Find the product
    const productreturned = await productmodel.findById(productId);

    if (!productreturned) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Update quantity and reason
    productreturned.quantity += findorder.products[0].quantity;
    findorder.returnReason = reason;

    const findwallet = await Wallet.findOne({ user: findorder.userId });
    console.log("findwallet",findwallet)
    if (!findwallet) {
      return res.status(404).json({ message: 'Wallet not found for the user' });
    }
    findwallet.transactions.push({
      type:'credit' ,
      orderId: findorder._id,
      amount: findorder.totalAmount,
      currency: 'INR',// Add the currency as needed
      description:'Product Returned From sneakPeakhub' 
    });
    // Assuming this is within a function or a block where findorder is accessible
findorder.products[0].cancelstatus = 'returned';

     // Update the balance
     findwallet.balance += findorder.totalAmount;

     // Save changes to the wallet
     await findwallet.save();


    // Save changes
    await findorder.save();
    await productreturned.save();
    
    console.log("findorder",findorder)
    console.log("productreturned",productreturned)

    res.status(200).json({ message: 'Product returned successfully' });
  } catch (error) {
    next(error);
  }
};





















const myorderdetailes = async (req, res) => {
  let userloggedin = false;
  if (req.session && req.session.userdata) {
    userloggedin = true;
  }
  const orderId = req.params.orderId; // Use req.params.orderId to get the order ID from the URL
  
  const productidmatch=req.query.productid
  
  try {
    // Assuming you have an Order model defined with Mongoose
    const order = await ordermodel.findById(orderId).populate('products.productId');
       order.products=order.products.filter((product)=>{
        return product.productId._id.toString()===productidmatch
       }) ;


    if (order) {
      console.log("Order found");
      // If order is found, pass it to the frontend
      res.render("user/orderdetailes", {order, userloggedin });
    } else {
      // Handle case when order is not found
      res.render('user/orderdetailes', { userloggedin, error: 'Order not found' });
    }
  } catch (error) {
    // Handle any errors that occur during the database query
    console.error(error);
    res.render('user/orderdetailes', { userloggedin, error: 'Error fetching order details' });
  }
};

const changepassword = async (req, res) => {
  try {
    const currentpass = req.body.currentpassword;
    const newpassword = req.body.newpassword;
    const confirmpassword = req.body.confirmpassword;
    const userID = req.session.userdata._id;

    const user = await usermodel.findById(userID);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isMatched = await bcrypt.compare(currentpass, user.password);

    if (!isMatched) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    if (newpassword !== confirmpassword) {
      return res.status(400).json({ error: 'New password and confirm password do not match' });
    }

    const hashedPassword = await bcrypt.hash(newpassword, 10);
    user.password = hashedPassword;

    await user.save();
    return res.status(200).json({ success: 'Password updated successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};








const logout = (req, res) => {
  // Assuming you are using express-session middleware
  req.session.destroy((err) => {
      if (err) {
          console.error('Error destroying session:', err);
          // Handle the error, e.g., by sending an error response
          res.status(500).send('Internal Server Error');
      } else {
          // Redirect to the login page or any other desired page after logout
          res.redirect('/');
      }
  });
};







module.exports={
    account,
 
    editaccountpost,
    addaddress,
    addresspost,
    EditAddress,
    changepassword,
    updateAddress, 
    myorderdetailes,
    cancelOrder,
    returnproduct,
    logout,


  
}