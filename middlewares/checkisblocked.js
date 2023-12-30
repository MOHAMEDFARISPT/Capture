const usermodel=require("../model/userschema")

const isblocked=async(req,res,next)=>{
    const userdata=req.session.userdata._id
    const user=await usermodel.findOne({_id:userdata})
    if(user.isblocked){
   return res.redirect('/login')
    }
    
 return next()
  
}


module.exports={
    isblocked
}


