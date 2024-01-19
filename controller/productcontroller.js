const express=require("express")
const productmodel=require("../model/productschema")
const categorymodel=require('../model/categoryschema')





const ITEMS_PER_PAGE = 5; // Number of items to display per page

const productlist = async (req, res) => {
  const page = +req.query.page || 1; // Get the requested page from query parameters
  try {
    const totalProducts = await productmodel.countDocuments({});
    const products = await productmodel.find({})
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE)
      .populate("category");

    res.render('admin/products', {
      products,
      currentPage: page,
      hasNextPage: ITEMS_PER_PAGE * page < totalProducts,
      hasPreviousPage: page > 1,
      nextPage: page + 1,
      previousPage: page - 1,
      lastPage: Math.ceil(totalProducts / ITEMS_PER_PAGE),
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
};
     
   
   
const addproduct=async(req,res)=>{
  const category=await categorymodel.find({})
    res.render('admin/addproducts',{category})
}

const formad=async(req,res)=>{
   


   const formdatas={

 productImage: req.files.map((img)=>img.path.replace(/\\/g, '/').replace('public/', '/')) ,
productname:req.body.productname,
description:req.body.description,
category:req.body.category,
quantity:req.body.quantity,
price:req.body.price,
size:req.body.size,
}

console.log(formdatas)
console.log("category",formdatas.category)

const createdata=await productmodel.create(formdatas)
console.log("created data",createdata)
console.log("data inserted successfully")
res.redirect('/admin/Products')
}


const unlistproducts=async(req,res)=>{
  console.log("paraaaams",req.params)
    try {
      const {productid}=req.params;
      const product=await productmodel.findById(productid)
     
      product.islist=!product.islist
      await product.save();
      res.status(200).json({ message: 'Product toggled successfully', islist: product.islist });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' })
    }


}
const Editproduct=async(req,res)=>{
   console.log("params",req.query.id)

   const product=await productmodel.findOne({_id:req.query.id})
   const category=await categorymodel.find({})
   
   if(product){
    res.render("admin/editproducts",{product,category})
   }else{
    res.redirect("/admin/products")
   }

}
const Editproductpost=async(req,res)=>{
 
 console.log("///////////////////////////////////////")
  const products=await productmodel.findOne({_id:req.params.Id})
  console.log(products)
  if(products){
 console.log('///////////////////////////////////////////////////////////////////////////////////////////////');
 console.log(req.body);
    products.productImage=products.productImage.concat(req.files.map((img)=>img.path.replace(/\\/g, '/').replace('public/', '/'))) ||products.productImage
  products.productname=req.body.productname ||  products.productname
  products.description=req.body.description || products.description
  products.category=req.body.category._id  ||  products.category
  products.quantity=req.body.quantity  ||  products.quantity
  products.price=req.body.price      ||   products.price
  products.size=req.body.size          || products.size
  

   await products.save()
   console.log("product detailes changed");
   res.redirect("/admin/products")
  


  }else{
    console.error(err)
  }
}

const removeImage=async(req,res)=>{
  try {
    const {productId,imageindex}=req.body

    const product=await productmodel.findOne({_id:productId});
    console.log("deveeee"+product)
    product.productImage.splice(imageindex,1)
    product.save()
    res.status(200).json({message:'image removed successfully'})    
  } catch (error) {
    console.log(error);
  }
}
        

       






module.exports={
    productlist,
    addproduct,
    formad,
    unlistproducts,
    Editproduct,
    Editproductpost,
    removeImage
}