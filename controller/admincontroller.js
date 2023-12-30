const express=require("express")
const usermodel=require("../model/userschema")

const bcrypt=require('bcrypt')
const  {AdminModel}=require("../model/adminschema")




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
            res.redirect('admin/adminlogin');
        }
    }); // <-- Add this closing parenthesis
};





  
 





module.exports={
    home,
    adminlogin,
    loginpost,
    listusers,
    blockUser,
    logout

}