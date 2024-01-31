const express=require("express")
const usermodel=require("../model/userschema")

const bcrypt=require('bcrypt')
const  {AdminModel}=require("../model/adminschema")
const addressModel = require('../model/addressschema');
const ordermodel=require('../model/orderschema')
const productmodel=require('../model/productschema');
const coupon=require('../model/couponschema')
const PDFDocument=require('pdfkit')
const ExcelJS = require('exceljs');



const dailysalesreports = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const ITEMS_PER_PAGE = 10; // Adjust this value based on your requirements

        const totalItems = await ordermodel.countDocuments({});
        const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

        console.log("Page:", page);
        console.log("Total Items:", totalItems);
        console.log("Total Pages:", totalPages);

        const data = await ordermodel
            .find({})
            .populate('products.productId')
            .skip((page - 1) * ITEMS_PER_PAGE)
            .limit(ITEMS_PER_PAGE);

        console.log("Data:", data);

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




const printReport = async (req, res) => {
    try {
        const data = await ordermodel.find({}).populate('products.productId');

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Sales Report');

        worksheet.columns = [
            { header: 'Order ID', key: 'orderId', width: 15 },
            { header: 'Product Name', key: 'productName', width: 30 },
            { header: 'Quantity', key: 'quantity', width: 10 },
            // Add more columns as needed
        ];

        data.forEach((order) => {
            order.products.forEach((product) => {
                worksheet.addRow({
                    orderId: order.orderId,
                    productName: product.productId.productname,
                    quantity: product.quantity,
                    total:product.total
                  
                    // Add more properties as needed
                });
            });
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=sales_report.xlsx');

        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};




module.exports={
    dailysalesreports,
    monthlyreport,
    yearlysalesreport,
    printReport

}