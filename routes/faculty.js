var Student = require('../models/student');
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
app.post('/', authenticate, function(req, res) {
  res.sendFile(path.resolve('public/faculty.html'));
});

app.get('/:param', authenticate, refreshToken, function(req, res) {
  var decoded = jwt_decode(req.headers.authorization);
  if (decoded.role == 'faculty') {
    if (req.params.param == 'getcourses') {
      FacFunctions.GetRegisteredCourses(req, res, decoded.emp_id);
    } else if (req.params.param == 'getattendance') {
      FacFunctions.getAttendance(req, res, decoded.emp_id);
    }
  } else {
    failureResponse(req, res, 'Not Authorized!');
  }
});


app.post('/:param', authenticate, refreshToken, function(req, res) {
  var decoded = jwt_decode(req.headers.authorization);
  if (decoded.role == 'faculty') {
    if (req.params.param == 'getaccesstoken') {
      FacFunctions.getAccessToken(req, res, decoded.emp_id);
    } else if (req.params.param == 'getstudents') {
      FacFunctions.getStudentList(req, res, decoded.emp_id);
    } else if (req.params.param == 'attendance') {
      FacFunctions.postAttendance(req, res, decoded.emp_id);
    } else if (req.params.param == 'addquiz') {
      FacFunctions.addQuiz(req, res, decoded.emp_id);
    } else if (req.params.param == 'addquestion') {
      FacFunctions.addQuestion(req, res, decoded.emp_id);
    }
  } else {
    failureResponse(req, res, 'Not authenticated');
  }
});

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


function failureResponse(req, res, message) {
  res.json({
    status: 0,
    message: message,
    newToken: req.token
  });
}
