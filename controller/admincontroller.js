const express=require("express")
const usermodel=require("../model/userschema")

const bcrypt=require('bcrypt')
const  {AdminModel}=require("../model/adminschema")
const addressModel = require('../model/addressschema');
const ordermodel=require('../model/orderschema')
const productmodel=require('../model/productschema');
const couponmodel=require('../model/couponschema')





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


const changeorderstatus = async (req, res,next) => {
    console.log("///????>>>/////???>><<<<");
    console.log("//////{   order stats  } ////////////" + req.body);
    const orderId = req.body.orderId;
    const orderStatus = req.body.selectedOrderStatus?.toLowerCase();
    const productId = req.body.productId;

    console.log(orderStatus);
    console.log(orderId);
  

    try {
        const orderproduct = await ordermodel.findById(orderId).populate('products.productId');
        console.log("////./././././" + orderproduct);
        if (orderproduct) {
            // Update cancelstatus for the target product in the order
            const targetProduct = orderproduct.products.find(product => product.productId._id.toString() === productId);
            console.log("targetProduct", targetProduct);

            if (targetProduct) {
                // Check if the targetProduct is found
                targetProduct.cancelstatus = orderStatus;
                targetProduct.adminstatuschanged=true
                
            }

            // Save the main orderproduct
            await orderproduct.save();
            console.log("targetProduct"+targetProduct)

            console.log('Order status and product cancel status updated successfully');

            res.status(200).json({ message: 'Order status updated successfully' });
        }
    } catch (error) {
        console.error('Error updating order status:', error.message);
        // res.status(500).json({ error: 'Internal Server Error' });
        error.adminError=true;
        next(error)
    }
};





const coupons = async (req, res) => {
    try {
        // Fetch all coupons from the database
        const coupon = await couponmodel.find({});

        // Render the view and pass the coupon data to it
        res.render("admin/couponlist", { coupon });
    } catch (error) {
        // Handle errors and respond with an error message
        console.error(error);
        res.status(500).json({
            message: 'Internal server error',
        });
    }
};


const addcoupons=async(req,res)=>{ 
res.render("admin/addcoupon")

  
};


//posting form coupon Data

const postcoupon = async (req, res) => {
    try {
        // Extract data from the request body
        const couponcode = req.body.couponCode;
        const description = req.body.description;
        const discountPercentage = req.body.Discountpercentage;
        const maximumDiscountAmount = req.body.maximumdiscountamount;
        const minimumAmount = req.body.minimumamount;
        const maximumAmount = req.body.maximumamount;
        const status = req.body.status;
        const expirationDate = req.body.expirationDate;

        // Check if the couponCode is provided and not null
        if (!couponcode || couponcode === null) {
            return res.status(400).json({
                message: 'Coupon code is required and must not be null',
            });
        }

        // Check if the couponCode is unique
        const existingCoupon = await couponmodel.findOne({ couponcode: couponcode });
        if (existingCoupon) {
            console.log("coupon exists");
            return res.status(400).json({
                message: 'Coupon code must be unique',
            });
        }

        // Create a new coupon object
        const newCoupon = new couponmodel({
            couponcode: couponcode,
            description: description,
            discount_percentage: discountPercentage,
            max_discount_amount: maximumDiscountAmount,
            min_amount: minimumAmount,
            max_amount: maximumAmount,
            status: status,
            expiry_date: new Date(expirationDate),
        });

        console.log("newcoupon", newCoupon);

        await newCoupon.save();
res.redirect('/admin/coupons')
     

           
     
    } catch (error) {
        // Handle errors and respond with an error message
        console.error(error);
      
    }
    
};









const coupondelete=async(req,res)=>{


    try {
        const { couponId } = req.params;
    
        // Perform deletion in the database (use Mongoose or your preferred ORM)
        const coupns =await couponmodel.findByIdAndDelete(couponId);
        console.log(coupns)
        console.log("deleted successfully");
    
        res.status(200).json({ message: 'Coupon deleted successfully' });
      } catch (error) {
        console.error('Error deleting coupon:', error);
        res.status(500).json({ message: 'Internal Server Error' });
      }
    
}

const editcoupon=async(req,res)=>{
    console.log("/////////////////////////");
    const couponId = req.query.itemId;
    console.log("couponId",couponId)
   try {
    const coupondetailes = await couponmodel.findById(couponId);
    console.log("coupondetailes",coupondetailes)




    res.render("admin/editcoupon",{coupondetailes})
   } catch (error) {
    console.error('Error fetching coupon details:', error);
    // Handle the error appropriately (send response, log, etc.)
   }

   

}


const editcouponpost=async(req,res)=>{



    const couponId = req.params.couponId;
    const {
      

        couponcode,
        description,
        Discountpercentage,
        maximumdiscountamount,
        minimumamount,
        maximumamount,
        expirationDate,
        status
    } = req.body;

    try {
        // Fetch the existing coupon details
        const existingCoupon = await couponmodel.findById(couponId);

        // Update the coupon details with the form data
        
        existingCoupon.couponcode = couponcode;
        existingCoupon.description = description;
        existingCoupon.discount_percentage = Discountpercentage;
        existingCoupon.max_discount_amount = maximumdiscountamount;
        existingCoupon.min_amount = minimumamount;
        existingCoupon.max_amount = maximumamount;
        existingCoupon.expiry_date = expirationDate;
        existingCoupon.status = status;

        // Save the updated coupon details
        await existingCoupon.save();

        // Redirect to a page or send a response
        res.redirect('/admin/dashboard');
    } catch (error) {
        console.error('Error updating coupon details:', error);
        // Handle the error appropriately (send response, log, etc.)
        res.status(500).send('Internal Server Error');
    }
};


 const listCoupon=async (req, res) => {
    try {
      const {couponid } = req.params;
      const Coupon = await couponmodel.findById(couponid);
  
      if (!Coupon) {
        return res.status(404).json({ message: 'Coupon not found' });
      }

  
      // Toggle the user's block status
      console.log(Coupon.islisted );
      Coupon.islisted = !Coupon.islisted 
      await Coupon.save();
      console.log(Coupon)
  
      res.status(200).json({ message: 'Coupon Listed/Unlisted  successfully', islisted: Coupon. islisted});
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
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
    changeorderstatus,
    coupons,
    addcoupons,
    postcoupon,
    coupondelete,
    editcoupon,
    editcouponpost,
    listCoupon
   

}