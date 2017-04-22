var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var Schema = mongoose.Schema;
var quizSchema = new Schema({
  quizId: {
    type: String,
    required: true
  }
});

var quiz = mongoose.model('QuizQuestions', quizSchema);
module.exports = quiz;
