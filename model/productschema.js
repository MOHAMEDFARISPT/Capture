

const mongoose = require('mongoose');
const express = require('express');
const bcrypt = require('bcrypt');

// Define the Product Schema
const productSchema = new mongoose.Schema({
  productImage:[{
    type:String
  }],
productname:String,
description:String,
category:{
  type:mongoose.Schema.Types.ObjectId,
  ref:'category'
},
price:Number,
quantity:Number,

size:String,

islist:{
  type:Boolean,
  default:true
},


})
// Create a Product model based on the schema
const Product = mongoose.model('Product', productSchema);

module.exports = Product;
