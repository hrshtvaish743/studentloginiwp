var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var Schema = mongoose.Schema;
var quizTempSchema = new Schema({
  quizId: {
    type: String,
    required: true
  },
  submitted : Boolean,
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
  questions : [
    {
      questionId : {
        type : String
      },
      attempted : {
        type : Boolean
      },
      marks : {
        type : Number
      }
    }
  ]
});

var quiz = mongoose.model('QuizTemp', quizTempSchema);
module.exports = quiz;
