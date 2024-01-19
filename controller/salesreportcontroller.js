const express=require("express")
const usermodel=require("../model/userschema")

const bcrypt=require('bcrypt')
const  {AdminModel}=require("../model/adminschema")
const addressModel = require('../model/addressschema');
const ordermodel=require('../model/orderschema')
const productmodel=require('../model/productschema');
const coupon=require('../model/couponschema')



const dailysalesreports=async(req,res)=>{



    const data=await ordermodel.find({}).populate('products.productId')
    res.render("admin/dailyreport",{data})
}


const monthlyreport=async(req,res)=>{
    const data=await ordermodel.find({}).populate('products.productId')
    res.render("admin/monthlyreport",{data})
}

const yearlysalesreport=async(req,res)=>{
    const data=await ordermodel.find({}).populate('products.productId')
    res.render("admin/yearlyreport",{data})
}




module.exports={
    dailysalesreports,
    monthlyreport,
    yearlysalesreport

}