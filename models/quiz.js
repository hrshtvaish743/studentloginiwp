var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var Schema = mongoose.Schema;
var quizSchema = new Schema({
  quizId: {
    type: String,
    required: true
  },
  open : {
    type : Boolean
  },
  name: {
    type: String,
    required: true
  },
  courseCode: {
    type: String,
    required: true
  },
  facultyId: {
    type: String,
    required: true
  },
  slot: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  startDate: {
    type: String,
    required: true
  },
  endDate: {
    type: String,
    required: true
  },
  numberOfAttempts: {
    type: String,
    required: true
  },
  numberOfQuestions: {
    type: String,
    required: true
  },
  duration : {
    type : String,
    required : true
  },
  questions : [
    {
      questionId : {
        type : String
      },
      question : {
        type : String
      },
      options : [
        {
          option : {
            type : String
          },
          optionId : {
            type : String
          }
        }
      ],
      answer : {
        type : String
      },
      marks : {
        type : Number
      }
    }
  ]
});

var quiz = mongoose.model('Quiz', quizSchema);
module.exports = quiz;
