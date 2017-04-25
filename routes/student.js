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

app.get('/', authenticate, function(req, res) {
  res.sendFile(path.resolve('public/student.html'));
});

app.post('/:param', authenticate, refreshToken, function(req, res) {
  var decoded = jwt_decode(req.headers.authorization);
  if (decoded.role == 'student') {
    if (req.params.param == 'joincourse') {
      StudFunctions.joinCourse(req, res, decoded.regno);
    } else if (req.params.param == 'attendance') {
      StudFunctions.getAttendance(req, res, decoded.regno);
    } else if (req.params.param == 'sendmessage') {
      StudFunctions.sendMessage(req, res, decoded.regno);
    } else if (req.params.param == 'postdiscussion') {
      StudFunctions.postDiscussion(req, res, decoded.regno);
    } else if (req.params.param == 'attemptquiz') {
      StudFunctions.attemptQuiz(req, res, decoded.regno);
    } else if (req.params.param == 'nextques') {
      StudFunctions.nextQuestion(req, res, decoded.regno);
    } else if (req.params.param == 'quizsubmit') {
      StudFunctions.submitQuiz(req, res, decoded.regno);
    } else if (req.params.param == 'getquizquestion') {
      StudFunctions.getQuestion(req, res, decoded.regno);
    }
  } else {
    failureResponse(req, res, 'Not authorized!');
  }
});

app.get('/:param', authenticate, refreshToken, function(req, res) {
  var decoded = jwt_decode(req.headers.authorization);
  if (decoded.role == 'student') {
    if (req.params.param == 'timetable') {
      StudFunctions.getTimetable(req, res, regno);
    } else if (req.params.param == 'marks') {
      StudFunctions.getMarks(req, res, decoded.regno);
    } else if (req.params.param == 'messages') {
      StudFunctions.getMessages(req, res, decoded.regno);
    } else if (req.params.param == 'quiz') {
      StudFunctions.getQuiz(req, res, decoded.regno);
    }
  } else {
    failureResponse(req, res, 'Not authorized!');
  }
});

module.exports = app;

function refreshToken(req, res, next) { // Function To Refresh Token on each request
  var decoded = jwt_decode(req.headers.authorization);
  req.token = jwt.sign({
    id: decoded.id,
    role: decoded.role,
    regno: decoded.regno
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
