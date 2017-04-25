var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var Schema = mongoose.Schema;
var quizSubSchema = new Schema({
  quizId: {
    type: String,
    required: true
  },
  regno: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  solutions : [
    {
      questionId : {
        type : String
      },
      answer : {
        type : String
      },
      marks : {
        type : Number
      }
    }
  ]
});

var quiz = mongoose.model('QuizSub', quizSubSchema);
module.exports = quiz;
