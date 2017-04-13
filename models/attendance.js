var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var Schema = mongoose.Schema;
var courseSchema = new Schema({
    regno: {
        type: String,
        required: true
    },
    courseCode: {
        type: String,
        required: true
    },
    slot: {
        type: String,
        required: true
    },
    attendance : [
      {
        slot: {
            type: String,
            required: true
        },
        date: {
            type: String,
            required: true
        },
        present : {
          type : Boolean,
          required : true
        }
      }
    ]


});

var course = mongoose.model('Courses', courseSchema);
module.exports = course;
