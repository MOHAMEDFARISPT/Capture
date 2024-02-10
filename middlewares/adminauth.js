// isAdmin middleware
const isAdmin = (req, res, next) => {
    // Check if the user is authenticated as an admin
    if ( req.session.admin) {
        console.log("hy")
       next()
    } else {
        
         res.redirect('/adminlogin')
    }
};

const backtologin=(req,res,next)=>{
    console.log("hyy")
    if(req.session.isloggedadmin){
        res.redirect("/admin")
    }else{
        
       next()
    }
}

module.exports ={
    isAdmin,backtologin
} 

