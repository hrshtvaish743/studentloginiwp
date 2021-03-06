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

app.get('/',isLoggedIn, function(req, res) {
  res.render('student/index', {
    student : req.user
  });
});

app.get('/profile', isLoggedIn,  function(req, res) {
  console.log(req.user);
  res.render('student/profile', {
    student : req.user
  });
});

app.post('/:param', isLoggedIn, function(req, res) {
  var decoded = req.user;
  if (decoded.role == 'student') {
    if (req.params.param == 'joincourse') {
      StudFunctions.joinCourse(req, res, decoded.regno);
    } else if (req.params.param == 'attendance') {
      StudFunctions.getAttendance(req, res, decoded.regno);
    } else if (req.params.param == 'sendmessage') {
      StudFunctions.sendMessage(req, res, decoded.regno);
    } else if (req.params.param == 'attemptquiz') {
      StudFunctions.attemptQuiz(req, res, decoded.regno);
    } else if (req.params.param == 'nextques') {
      StudFunctions.nextQuestion(req, res, decoded.regno);
    } else if (req.params.param == 'quizsubmit') {
      StudFunctions.submitQuiz(req, res, decoded.regno);
    } else if (req.params.param == 'getquizquestion') {
      StudFunctions.getQuestion(req, res, decoded.regno);
    } else if (req.params.param == 'marks') {
      StudFunctions.getMarks(req, res, decoded.regno);
    } else {
      failureResponse(req, res, 'Not Found');
    }
  } else {
    failureResponse(req, res, 'Not authorized!');
  }
});

app.get('/:param', isLoggedIn, function(req, res) {
  var decoded = req.user;
  if (decoded.role == 'student') {
    if (req.params.param == 'timetable') {
      StudFunctions.getTimetable(req, res, decoded.regno);
    } else if (req.params.param == 'marks') {
      res.render('student/marks', {
        student : req.user
      });
    } else if (req.params.param == 'messages') {
      StudFunctions.getMessages(req, res, decoded.regno);
    } else if (req.params.param == 'quiz') {
      StudFunctions.getQuiz(req, res, decoded.regno);
    } else if (req.params.param == 'joincourse') {
      res.render('student/joincourse', {
        student : req.user
      });
    } else if (req.params.param == 'newmessage') {
      res.render('student/newmessage', {
        student : req.user
      });
    } else if (req.params.param == 'attendance') {
      res.render('student/attendance', {
        student : req.user
      });
    } else if (req.params.param == 'logout') {
      req.logout();
      req.session.destroy();
      res.redirect("/");
    }
  } else {
    failureResponse(req, res, 'Not authorized!');
  }
});

module.exports = app;

function isLoggedIn (req, res, next) {
    if (req.isAuthenticated()) {
      return next()
    }
    res.redirect('/');
}


function failureResponse(req, res, message) {
  res.json({
    status: 0,
    message: message,
    newToken: req.token
  });
}
