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
app.get('/', isLoggedIn, function(req, res) {
  console.log(req.user);
  res.render('faculty/index', {
    faculty: req.user
  })
});

app.get('/:param', isLoggedIn, function(req, res) {
  var decoded = req.user;
  if (decoded.role == 'faculty') {
    if (req.params.param == 'courses') {
      FacFunctions.GetRegisteredCourses(req, res, decoded.empid);
    } else if (req.params.param == 'messages') {
      FacFunctions.getMessages(req, res, decoded.empid);
    } else if (req.params.param == 'quiz') {
      FacFunctions.getquizzes(req, res, decoded.empid);
    } else if (req.params.param == 'createtoken') {
      res.render('faculty/createtoken', {
        faculty: req.user
      });
    } else if (req.params.param == 'newmessage') {
      res.render('faculty/newmessage', {
        faculty: req.user
      });
    } else if (req.params.param == 'getstudents') {
      res.render('faculty/students', {
        faculty: req.user
      });
    } else if (req.params.param == 'logout') {
      req.logout();
      req.session.destroy();
      res.redirect("/");
    }
  } else {
    failureResponse(req, res, 'Not Authorized!');
  }
});


app.post('/:param', isLoggedIn, function(req, res) {
  var decoded = req.user;
  if (decoded.role == 'faculty') {
    if (req.params.param == 'getaccesstoken') {
      FacFunctions.getAccessToken(req, res, decoded.empid);
    } else if (req.params.param == 'getstudents') {
      FacFunctions.getStudentList(req, res, decoded.empid);
    } else if (req.params.param == 'attendance') {
      FacFunctions.postAttendance(req, res, decoded.empid);
    } else if (req.params.param == 'addquiz') {
      FacFunctions.addQuiz(req, res, decoded.empid);
    } else if (req.params.param == 'editquiz') {
      FacFunctions.editQuiz(req, res, decoded.empid);
    } else if (req.params.param == 'deletequiz') {
      FacFunctions.deleteQuiz(req, res, decoded.empid);
    } else if (req.params.param == 'addquizquestion') {
      FacFunctions.addQuizQuestion(req, res, decoded.empid);
    } else if (req.params.param == 'getattendance') {
      FacFunctions.getAttendance(req, res, decoded.empid);
    } else if (req.params.param == 'sendmessage-group') {
      FacFunctions.sendGroupMessage(req, res, decoded.empid);
    } else if (req.params.param == 'sendmessage-ind') {
      FacFunctions.sendIndMessage(req, res, decoded.empid);
    } else if (req.params.param == 'deletequizquestion') {
      FacFunctions.deleteQuizQuestion(req, res, decoded.empid);
    } else if (req.params.param == 'updatequizquestion') {
      FacFunctions.updateQuizQuestion(req, res, decoded.empid);
    } else if (req.params.param == 'openquiz') {
      FacFunctions.openQuiz(req, res, decoded.empid);
    } else if (req.params.param == 'closequiz') {
      FacFunctions.closeQuiz(req, res, decoded.empid);
    } else if (req.params.param == 'postmarks') {
      FacFunctions.postMarks(req, res, decoded.empid);
    } else if (req.params.param == 'addmarksplitup') {
      FacFunctions.marksSplitUp(req, res, decoded.empid);
    } else {
      failureResponse(req, res, 'Not Found');
    }
  } else {
    failureResponse(req, res, 'Not authenticated');
  }
});

module.exports = app;

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }
  res.redirect('/');
}

function refreshToken(req, res, next) { // Function To Refresh Token on each request
  var decoded = jwt_decode(req.headers.authorization);
  req.token = jwt.sign({
    id: decoded.id,
    role: decoded.role,
    empid: decoded.empid
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
