// isAdmin middleware
const isAdmin = (req, res, next) => {
    // Check if the user is authenticated as an admin
    if ( req.session.isloggedadmin) {
        console.log("hy")
        // User is authenticated as an admin, proceed to the next middleware or route handler
        next();
    } else {
        // User is not authenticated as an admin, redirect to an unauthorized page or show an error message
        res.status(403).send('Access Forbidden: You are not authorized to access this page.');
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

// module.exports = isAdmin,backtologin
