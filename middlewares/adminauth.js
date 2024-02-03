const isloggedinadmin=(req,res,next)=>{

    if(req.session.isloggedadmin){
        console.log("iffffff")
        res.redirect('/admin')
    }else{
        console.log("elseee")
        next()
    }


}

module.exports= isloggedinadmin
