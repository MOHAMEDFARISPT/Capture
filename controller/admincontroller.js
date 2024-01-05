const express=require("express")
const usermodel=require("../model/userschema")

const bcrypt=require('bcrypt')
const  {AdminModel}=require("../model/adminschema")
const addressModel = require('../model/addressschema');
const ordermodel=require('../model/orderschema')
const productmodel=require('../model/productschema')




// const adminlogin=(req,res)=>{
//     res.render("admin/login")
// }

const adminlogin = async function(req,res){
    try {
         res.render('admin/login')
    } catch (error) {
        console.log(error)
    }
}

const home=(req,res)=>{
    res.render("admin/home")
}

const loginpost = async (req, res) => {
   
    const {email,password}=req.body;
    
    try{
         
        const data = await AdminModel.findOne({email:email})


        
        if(!data){
            res.send("user not found")
        }
        if(data.password===password){
            res.redirect("/admin")
        }else{
           res.send(
                '<script>alert("Invalid Password"); window.location.href = "/admin/adminlogin";</script>'
            );
  
        }

    }catch(error){
        console.error(error);
        res.status(500).send('internal server error ')
    }
    
};






const listusers =async(req,res)=>{
   
usermodel.find({})
.then((userdatas)=>{
    res.render('admin/alluser',{userdatas});
}).catch ((error)=>{
    console.log(error);
}) 
}



 




 const blockUser=async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await usermodel.findById(userId);
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

  
      // Toggle the user's block status
      console.log(user.isblocked );
      user.isblocked = !user.isblocked 
      await user.save();
  
      res.status(200).json({ message: 'User status updated successfully', isBlocked: user.isblocked });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };



  const logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
        } else {
            // Redirect to the login page or any other desired page after logout
            res.redirect('/admin/adminlogin');
        }
    }); // <-- Add this closing parenthesis
};



const listorders=async(req,res)=>{

    const orders = await ordermodel.find({})
  .populate('products.productId')
  .populate('userId');
//   .populate('userId');  // Assuming userId references the 'users' model

    console.log("orderddddddddd"+orders);
res.render('admin/orderlist',{orders})


}


const orderdetailes=async(req,res)=>{
try {
    const orderId=req.params.orderId;
    console.log(orderId);
    const order = await ordermodel.findOne({_id:orderId}).populate('products.productId').populate('userId')
    
    
    res.render("admin/orderdetailesadmin",{order})
} catch (error) {
    console.error(error)
}
   
}


const changeorderstatus=async(req,res)=>{
    console.log("//////{   order stats  } ////////////"+req.body);
    const orderId = req.body.orderId;
    const orderStatus = req.body.selectedOrderStatus?.toLowerCase();

  console.log(orderStatus);
  console.log(orderId);

  try {
    const orderproduct=await ordermodel.findById(orderId).populate('products.productId')
    console.log("////./././././"+orderproduct);
    if (orderproduct) {
        // Update orderStatus for the main orderproduct
        orderproduct.orderStatus = orderStatus;
    
        // Update cancelstatus for each product in the order
        const productUpdates = orderproduct.products.map(async (item) => {
            item.cancelstatus = orderStatus;
            await item.save(); // Assuming item is a Mongoose model instance
        });
    
        // Wait for all product updates to complete
        await Promise.all(productUpdates);
    
        // Save the main orderproduct
        await orderproduct.save();
    
        console.log('Order status and product cancel status updated successfully');
    
    
        res.status(200).json({ message: 'Order status updated successfully' });
   
    }
   
  } catch (error) {
    console.error('Error updating order status:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};







  
 





module.exports={
    home,
    adminlogin,
    loginpost,
    listusers,
    blockUser,
    logout,
    listorders,
    orderdetailes,
    changeorderstatus

}