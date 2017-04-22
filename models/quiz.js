var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var Schema = mongoose.Schema;
var quizSchema = new Schema({
  quizId: {
    type: String,
    required: true
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
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
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
  questions : [
    {
      questionId : {
        type : String,
        required : true
      }
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
      }
    }
  ]
});

var quiz = mongoose.model('Quiz', quizSchema);
module.exports = quiz;
