var Student = require('../models/student');
var Faculty = require('../models/faculty');
var Course = require('../models/course');
var FacFunctions = require('../functions/faculty');
var StudFunctions = require('../functions/student');

var jwt = require('jsonwebtoken');
var config = require('../config/config.js');
var expressJwt = require('express-jwt');
var authenticate = expressJwt({
    secret: config.Secret
});
var jwt_decode = require('jwt-decode');
var async = require('async');
var path = require('path');
var express = require('express');
var app = express.Router();
var passport = require('passport');
require('../passport/passport.js')(passport);

// INDEX ===========================
app.get('/', function(req, res) {
    res.sendFile(path.resolve('public/index.html'));
});

app.post('/addfac', function(req, res) {
    Faculty.findOne({
        'empid': req.body.empid
    }, function(err, fac) {
        if (fac) {
            failureResponse(req, res, 'Faculty already added!');
        } else {
            newFac = new Faculty();
            newFac.empid = req.body.empid;
            newFac.name = req.body.name;
            newFac.email = req.body.email;
            newFac.phone = req.body.phone;
            newFac.role = "faculty";
            newFac.password = newFac.generateHash(req.body.password);
            console.log(req.body.empid);
            newFac.save(function(err) {
                if (err) throw err;
                res.json({
                    message: "Faculty Added"
                });
            });
        }
    });
});

app.post('/addstudent', function(req, res) {
    Student.findOne({
        'regno': req.body.regno
    }, function(err, stud) {
        if (stud) {
            failureResponse(req, res, 'Student already added!');
        } else {
            newStud = new Student();
            newStud.regno = req.body.regno;
            newStud.name = req.body.name;
            newStud.email = req.body.email;
            newStud.phone = req.body.phone;
            newStud.role = "student";
            newStud.password = newStud.generateHash(req.body.password);
            console.log(newStud);
            newStud.save(function(err) {
                if (err) throw err;
                res.json({
                    message: "Student Added"
                });
            });
        }
    });
});

app.get('/getcourses', function(req, res) {
    Course.find({}, function(err, courses) {
        res.json({
            courses: courses
        });
    });
});

app.post('/addcourse', function(req, res) {
    Course.findOne({
        'code': req.body.code,
        'semester': req.body.sem
    }, function(err, course) {
        if (course) {
            failureResponse(req, res, 'Course already added!');
        } else {
            var newCourse = new Course();
            newCourse.code = req.body.code;
            newCourse.name = req.body.name;
            newCourse.slots = req.body.slots.split(',');
            newCourse.faculties = req.body.faculties.split(',');
            newCourse.semester = req.body.sem;
            newCourse.credits = req.body.credits;
            newCourse.type = req.body.type;
            console.log(newCourse);
            newCourse.save(function(err) {
                if (err) throw err;
                res.json({
                    message: "Course Added"
                });
            });
        }
    });
});

// LOGIN =================================

app.post('/login/student', passport.authenticate('student-login', {
    failureRedirect: '/login/student', // redirect back to the login page if there is an error
    failureFlash: true, // allow flash messages
    session: false
}), generateStudToken, respond);


app.post('/login/faculty', passport.authenticate('faculty-login', {
    failureRedirect: '/login/faculty', // redirect back to the login page if there is an error
    failureFlash: true, // allow flash messages
    session: false
}), generateToken, respond);


module.exports = app;

function refreshToken(req, res, next) { // Function To Refresh Token on each request
    var decoded = jwt_decode(req.headers.authorization);
    req.token = jwt.sign({
        id: decoded.id,
        role: decoded.role,
        emp_id: decoded.emp_id
    }, config.Secret, {
        expiresIn: 120 * 60
    });
    next();
}

//Function to generate a JWT token using the website secret
function generateToken(req, res, next) {
    req.token = jwt.sign({
        id: req.user.id,
        role: req.user.role,
        emp_id: req.user.empid
    }, config.Secret, {
        expiresIn: 120 * 60
    });
    next();
}

function generateStudToken(req, res, next) {
    req.token = jwt.sign({
        id: req.user.id,
        role: req.user.role,
        regno: req.user.regno
    }, config.Secret, {
        expiresIn: 120 * 60
    });
    next();
}


//function to respond after generation on token
function respond(req, res) {
    var user = req.user;
    user._id = null;
    user.password = null;
    res.status(200).json({
        status: 1,
        user: user,
        token: req.token
    });
}

function failureResponse(req, res, message) {
    res.json({
        status: 0,
        message: message,
        newToken: req.token
    });
}
