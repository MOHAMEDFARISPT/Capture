const express=require("express")
const usermodel=require("../model/userschema")

const bcrypt=require('bcrypt')
const  {AdminModel}=require("../model/adminschema")
const addressModel = require('../model/addressschema');
const ordermodel=require('../model/orderschema')
const productmodel=require('../model/productschema');
const coupon=require('../model/couponschema')




const dailysalesreports = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;

        const totalItems = await ordermodel.countDocuments({});
        const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

        const data = await ordermodel
            .find({})
            .populate('products.productId')
            .skip((page - 1) * ITEMS_PER_PAGE)
            .limit(ITEMS_PER_PAGE);

        res.render('admin/dailyreport', {
            data,
            currentPage: page,
            totalPages,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};



const monthlyreport = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;

        const totalItems = await ordermodel.countDocuments({});
        const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

        const data = await ordermodel
            .find({})
            .populate('products.productId')
            .skip((page - 1) * ITEMS_PER_PAGE)
            .limit(ITEMS_PER_PAGE);

        res.render('admin/monthlyreport', {
            data,
            currentPage: page,
            totalPages,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};

const ITEMS_PER_PAGE = 10; // Adjust the number of items per page as needed

const yearlysalesreport = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;

        const totalItems = await ordermodel.countDocuments({});
        const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

        const data = await ordermodel
            .find({})
            .populate('products.productId')
            .skip((page - 1) * ITEMS_PER_PAGE)
            .limit(ITEMS_PER_PAGE);

        res.render('admin/yearlyreport', {
            data,
            currentPage: page,
            totalPages,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};





module.exports={
    dailysalesreports,
    monthlyreport,
    yearlysalesreport

}