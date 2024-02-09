// isAdmin middleware
const isAdmin = (req, res, next) => {
    // Check if the user is authenticated as an admin
    if ( req.session.admin) {
        
        console.log("ifnte ullikl.admin")
       next()
    } else {
        console.log("elseinteullikl.admin")
        
         res.redirect('/adminlogin')
    }
};

const backtologin=(req,res,next)=>{
    
    if(req.session.isloggedadmin){

        console.log("ifnte ullik.islogeed")
        res.redirect("/")
    }else{
        console.log("elsinte ullik.islogeed")
        
       next()
    }
}

module.exports ={
    isAdmin,backtologin
} 

