const express=require("express")
const usermodel=require("../model/userschema")
const productcontroller=require('../model/productschema')
const usercontroller=require('../controller/usercontroller')
const router=express.Router()
const addressmodel=require('../model/addressschema')

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

    res.render('user/dashboard', { data, address,userloggedin });
  } catch (error) {
    // Handle any errors that occurred during the process
    console.error("Error in the 'account' controller:", error);
    res.status(500).send("Internal Server Error");
  }
};

const editaccount=(req,res)=>{
    const data=req.session.userdata

    res.render('user/editaddress',{data})
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
    logout

  
}