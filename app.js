const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose=require('mongoose')
const session=require("express-session")

const adminRouter = require('./routes/admin');
const usersRouter = require('./routes/users');
const {error}=require("console")

require("dotenv").config();
                    
const app = express();

// view engine setup


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));








app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));




app.use(session({
  secret: 'your-secret-key', // Change this to a random and secure secret key
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true if your application is served over HTTPS
}));


app.use('/admin', adminRouter);
app.use('/', usersRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  // next(createError(404));
  next()
});

// mongoose.connect(process.env.DB_MONGO,{

const connect=mongoose.connect("mongodb://127.0.0.1:27017/Capture")
  // useNewUrlparser:true,
  // useUnifiedTopology:true, 

connect.then(()=>{
  console.log("Mongo db connected successfully");
})
.catch((error)=>{
  console.log(error)
})


// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  console.log(err)
  // res.status(err.status || 500);
  // res.render('error');
  res.send(err)
});

module.exports = app;
