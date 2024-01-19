function errorHanlder(err,req,res,next){
    let statuscode=500;
    if(err.adminError){
        statuscode=500;
        return res.render("user/404",{error:err.message})
    }else{
        statuscode=500;
        console.log("ethy")
        console.log(err)
        return res.render("user/500.ejs",{error:err.message})
    }
    res.status(statuscode).send("internal server error")
}


module.exports= errorHanlder