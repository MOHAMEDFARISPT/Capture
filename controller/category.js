const express = require('express');
const router = express.Router();
const Categorymodel = require('../model/categoryschema');
const multer=require('multer')
const path=require('path');
const { Script } = require('vm');



const adcategory=(req,res)=>{
  try {
      res.render('admin/addnewcategory')
  } catch(error) {
      console.log(error)
      
  }
}


const addcategory = async (req, res) => {
  try {
    console.log(req.body);
    

    const categoryName = req.body.categoryname;

    // Check if category with the same first letter already exists (case-sensitive)
    const existingCategory = await Categorymodel.findOne({
      categoryname: { $regex: new RegExp(`^${categoryName.charAt(0)}`, 'i') }
    });

    if (existingCategory) {
      // Display a simple alert if the category already exists
      return res.send(
        '<script>alert("This category already exists"); window.location.href = "/addcategory";</script>'
      );
    } else {
      const data = {
        categoryname: categoryName,
        description: req.body.description,
        image: req.file?.path.replace(/\\/g, '/').replace('public/', '/') || null,
      };

      console.log("data", data);

      const createdData = await Categorymodel.create(data);

      console.log(createdData);
      console.log("Category inserted successfully");
      res.redirect('/shop');
    }
  } catch (error) {
    console.error('Error adding category:', error);
    // Handle the error, e.g., send an error response
    res.status(500).send('Internal Server Error');
  }
};





const listcategery=async(req,res)=>{
 const category = await Categorymodel.find();
 console.log(category);
  
    res.render('admin/categorylist',{category})

  

}

const unlistcategory=async (req, res) => {
  try {
    console.log("params",req.params)
    const { categoryid } = req.params;
    const category = await Categorymodel.findById(categoryid);

    
    category.islist = !category.islist
    await category.save();

    res.status(200).json({ message: 'User status updated successfully', islist: category.islist});
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};



const Editcategory=async (req,res)=>{
  try {
    console.log(req.query.id);
    const Category = await Categorymodel.findOne({_id:req.query.id})
    console.log(Category)
    if(Category){

      
      res.render('admin/categeryedit',{Category})
    }else{
      res.redirect('/categorylist')
    }
    
  } catch (error) {
    console.log(error)
    
  }
}
const Editcategorypost = async (req, res) => {
  try {
   
    const category = await Categorymodel.findOne({ _id: req.params.Id });
    console.log(category);

    if (category) {
      // Check if the updated category name conflicts with existing categories
      const existingCategory = await Categorymodel.findOne({
        categoryname: req.body.categoryname,
        _id: { $ne: category._id } // Exclude the current category from the search
      });

      if (existingCategory) {
        // Handle the case where the updated category name conflicts with an existing category
        console.log('Category name already exists');
        res.redirect('/shop'); // Redirect to an appropriate page or show an error
        return;
      }

      // Update the category details
      category.categoryname = req.body.categoryname;
      category.image = req.file?.path.replace(/\\/g, '/').replace('public/', '/') || category.image;
      category.description = req.body.description;

      await category.save();
      console.log('Category saved successfully');
      res.redirect('/shop'); // Redirect to a success page
    }
  } catch (error) {
    console.log(error);
    // Handle any errors that occur during the update process
    res.redirect('/categeryedit'); // Redirect to an edit page or show an error
  }
};



     
      
      
     
    

module.exports={
    addcategory,
    listcategery,
    unlistcategory,
    Editcategory,
    Editcategorypost,
    adcategory
    
   
}







































































































































































































































































































































































































































































































































































