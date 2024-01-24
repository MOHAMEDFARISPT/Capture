const bcrypt = require('bcrypt');
const usermodel=require("../model/userschema")
const productmodel=require('../model/productschema')
const categorymodel=require('../model/categoryschema')
require('dotenv').config();
const nodemailer = require('nodemailer');
const randomstring = require('randomstring');
const session=require('express-session');
const { productlist } = require('./productcontroller');
const { EventEmitterAsyncResource } = require('nodemailer/lib/xoauth2');
const { query } = require('express');
const addressModel = require('../model/addressschema');
const ordermodel=require('../model/orderschema')
const easyinvoice = require('easyinvoice');
const Wallet=require("../model/walletschema");
const shortid = require('shortid');
const mongoose = require('mongoose');


const login=(req,res)=>{
 
    res.render("user/login")
}


const getsign  = (req,res)=>{
    res.render('user/index')
}
const signup=(req,res)=>{
    res.render("user/signup")
}

const otp=(req,res)=>{
    res.render("user/otp")
}
const home=async(req,res)=>{

  let userloggedin = false;
  if(req.session && req.session.userdata){
    userloggedin=true;
  }


    const products=await productmodel.find({}).limit(10)
  console.log(products);

    res.render("user/index",{products,userloggedin})
}
const forgetpass=(req,res)=>{
  res.render("user/forgotpass")
}

const resetpass=(req,res)=>{
  res.render("user/changepass")
}

const product=async(req,res)=>{

  let userloggedin = false;
  if(req.session && req.session.userdata){
    userloggedin=true;
  }

  console.log("query",req.query)
  const product=await productmodel.findById(req.query.id)

  console.log("product",product)

  res.render('user/products',{product,userloggedin})
}




const category = async (req, res) => {
  let userloggedin = false;

  if (req.session && req.session.userdata) {
    userloggedin = true;
  }

  const categoryId = req.query.categoryId;
  const searchQuery = req.query.search;

  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 9) || 9;

  let product;
  let totalProducts;

  try {
    let query = { islist: true };

    if (categoryId) {
      query.category = categoryId;
    }

    if (searchQuery && searchQuery.length > 0) {
      console.log(`Searching products with query: ${searchQuery}`);
      const regexPattern = { $regex: searchQuery, $options: 'i' };
      query.$or = [
        { name: regexPattern },
        { description: regexPattern }
      ];
      console.log('Regex pattern for name:', regexPattern);
    }
    product = await productmodel.find(query).populate('category').skip((page - 1) * limit).limit(limit);
    console.log('Products found:', product.map(p => ({ name: p.productname, description: p.description })));
    
    totalProducts = await productmodel.countDocuments(query); // Count total products
    
    const totalPages = Math.ceil(totalProducts / limit);
    
    const category = await categorymodel.find();
    
    console.log("Products passed to EJS:", product);
    res.render('user/category', {
      category,
      product,
      userloggedin,
      totalPages,
      currentPage: page,
      searchQuery 
    });
    
  } catch (error) {
    console.error(error);
   next(error)
  }
};









const wishlist=(req,res)=>{
  let userloggedin = false;
  if(req.session && req.session.userdata){
    userloggedin=true;
  }
  res.render("user/wishlist",{userloggedin})
}


const addtowishlist=(req,res)=>{


}












const securePassword = async (password) => {
    try {
        const passwordHash = await bcrypt.hash(password, 10);
        return passwordHash;
    } catch (error) {
        console.log(error.message);
    }
};
console.log("secure",securePassword)

function generateOtp() {
    return randomstring.generate({
        length: 6,
        charset: 'numeric',
       
    });
}

function sendOtp(email, otp) {

    console.log(email, otp)
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_ADDRESS,
            pass: process.env.EMAIL_PASSWORD
        },
    });



    console.log( process.env.EMAIL_ADDRESS,
        process.env.EMAIL_PASSWORD   
   )

    const mailOptions = {
        from: process.env.EMAIL_ADDRESS,
        to: email,
        subject: 'your verififcation otp ',
        text: `Your OTP for verification code is  ${otp}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email: ' + error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}
function sendresetlink(email, token) {

  console.log(email, token)
  const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
          user: process.env.EMAIL_ADDRESS,
          pass: process.env.EMAIL_PASSWORD
      },
  });



  console.log( process.env.EMAIL_ADDRESS,
      process.env.EMAIL_PASSWORD   
 )

 const resetPasswordLink = `http://localhost:3000/reset-password?token=${token}`;

 const mailOptions = {
   from: process.env.EMAIL_ADDRESS,
   to: email,
   subject:'hyyhyhy',
   html: `<p>Click the following link to reset your password:</p><p><a href="${resetPasswordLink}">${resetPasswordLink}</a></p>`,
 };

  transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
          console.error('Error sending email: ' + error);
      } else {
          console.log('Email sent: ' + info.response);
      }
  });
}

const signuppost = async (req, res) => {
  try {
      const { firstname, lastname, email, contact, password,referalcode } = req.body;
      console.log("referalcode",referalcode)


      const checkEmail = await usermodel.findOne({ email: email });

      if (checkEmail) {
       
        res.render('user/login', );


          return;
      }

      const hashedPassword = await securePassword(password);

      // const user = await usermodel.create({
      //     firstname: firstname,
      //     lastname: lastname,
      //     contact: contact,
      //     email: email,
      //     password: hashedPassword,
      // });

      req.session.userData = {
        
          firstname: firstname,
          lastname: lastname,
          contact: contact,
          email: email,
          password: hashedPassword,

      };
      if(referalcode){
        console.log("/")
        referrer=await usermodel.findOne({refferalCode:referalcode})
        console.log("referrer",referrer)
        req.session.referral=referrer._id
        
      }else{
        referrer=""
      }

      const otp = generateOtp();
      const expirationTime = new Date(Date.now() + 30 * 1000);

      req.session.otp = {
          code: otp,
          generatedAt: Date.now(),
          expirationTime: expirationTime.getTime()
      };

      sendOtp(email, otp);
      console.log("otp",otp)

      res.redirect('/otp');
      return;
  } catch (error) {
      console.log(error.message);
      res.status(500).send('Internal Server Error');
  }
};

// otp verification and database inserting data
const otpverification = async (req, res) => {
  try {
    const enteredOtp = req.body.otp;

    if (req.session.otp && req.session.otp.code === enteredOtp && req.session.otp.expirationTime > Date.now()) {
      
      const referrer = req.session.referral || null;
      req.session.referral = "";

      const datas = await usermodel.create({
        firstname: req.session.userData.firstname,
        lastname: req.session.userData.lastname,
        contact: req.session.userData.contact,
        email: req.session.userData.email,
        password: req.session.userData.password,
        referrer: referrer,
        refferalCode: generateReferralcode(),
      });

      await Wallet.create({
        user: datas._id,
        balance: 0,
        transactions: [],
        pendingOrder: {
          orderId: null,
          amount: 0,
          currency: null,
        },
      });

      if (mongoose.Types.ObjectId.isValid(referrer)) {
        const data = await Wallet.findOne({user:referrer});
        
        if (data) {
          data.balance = (data.balance|| 0) + 250;
          data.transactions.push({
            amount:data.balance,
            type:'credit',
            description:'referal earning'
          })
          await data.save();
        }
      }

      console.log(datas);

      // Clear user data from session

      // Redirect after successful verification
      return res.status(200).redirect('/login');
    } else {
      return res.send('<script>alert("Invalid OTP or your time has expired"); window.location.href = "/otp";</script>');
    }
  } catch (error) {
    console.error("Error in OTP verification:", error);
    res.status(500).send("Internal Server Error");
  }
};


function generateReferralcode(){
  const referralcode=shortid.generate()
  return referralcode;
}


const resendotp = (req, res) => {
  const otp = generateOtp();
  const email = req.session.userData.email;

  const expirationTime = new Date(Date.now() + 30 * 1000);
  req.session.otp = {
      code: otp,
      generatedAt: Date.now(),
      expirationTime: expirationTime.getTime()
  };

  sendOtp(email, otp);

  res.redirect('/otp');
};




// login user post
const loginpost = async(req, res) => {
    try {
      console.log("bodujhj",req.body)
      const loguser = await usermodel.findOne({ email: req.body.email });
      console.log(loguser);
      if (loguser) {
       
        if(loguser.isblocked){
          res.redirect("/login")
          return;
        }
        const passwordMatch =await bcrypt.compare(req.body.password, loguser.password);
        if (passwordMatch) {
         
          
          req.session.userdata=loguser
          res.status(200)
          console.log("userdatasessiooon"+req.session.userdata);
          res.redirect('/');
        
        

         

          
        }
      } else {
        req.session.errorMessage = 'Invalid Password';
        res.redirect('/login');
        console.log("invalid password")
      }
    } catch (error) {
      console.log(error);
      req.session.error = error;
      res.redirect('/login');
    }
  };


  const forgotpass = async (req, res) => {
    try {
      const { email } = req.body;
      const checkemail = await usermodel.findOne({ email });
  
      if (checkemail && checkemail.email === email) {
        // Generate and set reset password token
        const token = checkemail.getResetpasswordToken();
        console.log('Reset Token:', token);
  
        // Set reset password token and expiration time in the user document
        checkemail.resetpasswordToken = token;
        checkemail.resetpasswordExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  
        // Save the updated user document
        await checkemail.save();
  
        // Redirect to the OTP verification page
        // Generate and send OTP
        sendresetlink(email, token);
        res.send(`
    <script>
        alert("Resetting link has been sent to ${email}");
        window.location.href = "/"; // Redirect to the home page or any desired URL
    </script>
`);
       
      }else{
        res.send(`
    <script>
        alert("${email}  is not exist ");
        window.location.href = "/forgetpass"; // Redirect to the home page or any desired URL
    </script>
`);
      }
    } catch (error) {
      // Handle errors appropriately
      console.error(error);
      res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  };
  

const resetpassword = async(req,res)=>{
  try{
    let token = req.query.token;
    const user = await usermodel.findOne({resetpasswordToken:token});
    if(user){
      res.render('user/changepass',{token})
    }else{
      res.render("user/404")
    }
  }catch(err){
    console.log(err);
  }
}

const resetPasswordPost =async(req,res)=>{
  try{
    const token = req.query.token;
    const user = await usermodel.findOne({resetpasswordToken:token});
    if(user){
      const { password ,confirmpassword} = req.body;
      if(password===confirmpassword){
        const hashedPassword = await securePassword(password);
       
        user.password=hashedPassword;
        user.save();
        res.redirect('/login')
      }
    }
  }catch(err){
    console.log(err);
  }
} 



const success = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    console.log("orderIdparaaaaaaaaaaaaams"+orderId)

    const order = await ordermodel.find({orderId} )
    console.log("orderrrrr",order)

    if (order.length > 0) {
        // Orders found, you can now use the 'orders' array
        console.log('Found orders:', order);
    } else {
        // No orders found
        console.log('No orders found');
    }
    
    res.render("user/sucessconfirm",{order})
    


} catch (error) {
    // Handle other errors
    console.error('Error fetching order details:', error);
    res.status(500).json({ message: 'Internal Server Error' });
}
};



const invoice=async(req,res)=>{
  const orderId=req.params.orderId
console.log("paraaaaamsssssssseeeeeeeee"+req.params.orderId)
const order=await ordermodel.findById(orderId).populate('userId').populate('products.productId')
console.log("order"+order)


const data = {
  documentTitle: 'Invoice',
  currency: 'USD',
  taxNotation: 'gst', // or 'vat' or 'gst'
  marginTop: 25,
  marginRight: 25,
  marginLeft: 25,
  marginBottom: 25,
  logo: 'https://example.com/logo.png', // Optional: Add your logo URL
  sender: {
    company: 'Sneak Peak Hub',
    address: 'farismohammed097@gmail.com',
    zip: '679338',
    city: 'Valanchery',
    state: 'Kerala',
  },
  client: {
    company: `${order.userId.firstname}`,
    phone: `${order.address.mobile}`,
    address: `${order.address.homeAddess}`,
    zip: `${order.address.pincode}`,
    city: `${order.address.city}`,
    state: `${order.address.state}`,
  },
  invoiceNumber: `INV-${orderId}`,
  invoiceDate: new Date().toDateString(),
  products: [],
};

for (const product of order.products) {
  data.products.push({
    quantity: `${product.quantity}`, // Assuming quantity is directly available in the product object
    description: `${product.productId.productname}`,
   
    price: `${product.productId.price}`,
  });
}


// Generate the PDF
const result = await easyinvoice.createInvoice(data);

// Set response headers to trigger a download
res.setHeader('Content-Type', 'application/pdf');
res.setHeader('Content-Disposition', `attachment; filename="invoice-${order._id}.pdf"`);

// Send the PDF as a buffer to the response stream
res.send(Buffer.from(result.pdf, 'base64'));

}
  















module.exports = {
    login,
    home,
    signuppost,
    signup,
    otp,
    otpverification,
    resendotp,
    loginpost,
    forgetpass,
    forgotpass,
    resetpass,
    resetpassword,
    resetPasswordPost,
    product,
    category,
    success,
    invoice
    
   
  
    

    // Other exported functions
};




