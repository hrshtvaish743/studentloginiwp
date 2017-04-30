var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var Schema = mongoose.Schema;
var marksSchema = new Schema({
    facultyId: {
        type: String,
        required: true
    },
    courseCode: {
        type: String,
        required: true
    },
    slot : String,
    component : String,
    marks : [
      {
        regno : String,
        marks : String
      }
    ]
});

var marks = mongoose.model('Marks', marksSchema);
module.exports = marks;
