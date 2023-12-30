const mongoose=require('mongoose')
const Schema=mongoose.Schema;
const bcrypt=require('bcrypt');


const categorySchema=new Schema({
    categoryname: {
        type: String,
        
      },
      image: {
        type: String,
   
      },
      description: {
        type: String,
       
      },
      islist:{
        type:Boolean,
       default:false
      }
    });

    const category=mongoose.model('category',categorySchema)
    module.exports=category;
