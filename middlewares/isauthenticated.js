const usermodel=require("../model/userschema")


const checkingsession=(req,res,next)=>{

if(req.session.userdata){
    next()
}else{
  res.redirect("/login")
}
}

const backtologin=(req,res,next)=>{
    if(req.session.userdata){
        res.redirect("/")
    }else{
       next()
    }
}











module.exports={
    checkingsession,
    backtologin,
    

}