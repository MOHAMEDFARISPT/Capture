// isAdmin middleware
const isAdmin = (req, res, next) => {
    // Check if the user is authenticated as an admin
    if ( req.session.admin) {
        console.log("okkkkkk")
       next()
    } else {
        console.log("not iokkkuyy")
        
         res.redirect('/adminlogin')
    }
};

const backtologin=(req,res,next)=>{
    console.log("hyy")
    if(req.session.isloggedadmin){
        console.log("isloggedadmin")
        res.redirect("/adminpanel")
    }else{
        console.log("not sillogged admin")
        
       next()
    }
}

module.exports ={
    isAdmin,backtologin
} 

