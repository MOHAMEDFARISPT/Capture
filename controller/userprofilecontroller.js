const express=require("express")
const usermodel=require("../model/userschema")
const productcontroller=require('../model/productschema')
const usercontroller=require('../controller/usercontroller')
const router=express.Router()
const addressmodel=require('../model/addressschema')
const cartModel = require("../model/cartschema")
const ordermodel=require("../model/orderschema")
const productmodel=require('../model/productschema')

const account = async (req, res) => {
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
      // You might want to redirect to an error page or handle this differently
      return res.render('user/dashboard', { data, address: null ,userloggedin});
    }
    const orders=await  ordermodel.find({userId:data._id}).populate("products.productId")
    console.log("//////////orders//////////////"+orders);

    
    res.render('user/dashboard', {orders,data, address,userloggedin });
  } catch (error) {
    // Handle any errors that occurred during the process
    console.error("Error in the 'account' controller:", error);
    res.status(500).send("Internal Server Error");
  }
};

const editaccount=(req,res)=>{
    const data=req.session.userdata

    res.render('user/editaccount',{data})
}
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




const addresspost = async (req, res) => {
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
    res.status(500).json({ message: 'Internal Server Error' });
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






const cancelOrder=async(req,res)=>{
  
  const orderId=req.body.orderId;
  const productId=req.body.productId
  
  const orderproduct=await ordermodel.findById(orderId).populate('products.productId')
if(!orderproduct){
  return res.status(404).json({message:'order not found'})

}
    const matchedproduct = orderproduct.products.find(prdct => prdct.productId._id.toString() === productId);
   if(!matchedproduct){
    return res.status(404).json({message:'Product is not found'})
   }
   const product=await productmodel.findById(productId);
if(!product){
  return res.status(404).json({ message: 'Product not found in the database' });
}
product.quantity +=matchedproduct.quantity
await product.save()
  
matchedproduct.cancelstatus = 'canceled';

    await orderproduct.save()
    console.log("product cancelled")
    res.status(200).json({message:'product cancelled!!'})
  }
 



















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
    editaccount,
    editaccountpost,
    addaddress,
    addresspost,
    EditAddress,
    updateAddress, 
    myorderdetailes,
    cancelOrder,
    logout,

  
}