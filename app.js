const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const session = require("express-session");
const nocache = require('nocache');
const adminRouter = require('./routes/admin');
const usersRouter = require('./routes/users');
const errorHandler = require('./middlewares/errorhandler');
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
app.use(nocache());

app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

app.use('/', adminRouter);
app.use('/', usersRouter);

app.get('*',(req,res,next)=>{
  res.render('user/404');
});

app.use(errorHandler);

const connect = mongoose.connect(process.env.DB_MONGO);

connect.then(() => {
  console.log("MongoDB connected successfully");
}).catch((error) => {
  console.log(error);
});

// Error handler
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  console.log(err);
  res.send(err);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
