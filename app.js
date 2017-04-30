var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var flash = require('connect-flash');
var passport = require('passport');
var session = require('express-session');
var configDB = require('./config/database.js');
var unirest = require('unirest');

mongoose.connect(configDB.url, function(err) {
    if (err) {
        console.log("Can't connect to DB!");
        throw err;
    }
    console.log('Connected to database!');
});


var app = express();
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: 'iamharshitvaish',
    cookie: {
        maxAge: 60000000
    },
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session
app.set('view engine', 'ejs');

var index = require('./routes/index.js');
var student = require('./routes/student.js');
var faculty = require('./routes/faculty.js');

app.use('/', index);
app.use('/student', student);
app.use('/faculty', faculty);



// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.jpg')));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        console.log(err);
        res.send(err);
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.sendFile(path.resolve('public/error.html'));
});

module.exports = app;
