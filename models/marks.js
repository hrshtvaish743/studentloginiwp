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
    marksSplitUp : [
      {
        component : {
          type : String
        },
        maxMarks : {
          type : Number
        }
      }
    ],
    marks : [
      {
        regno : String,
        component : String

      }
    ]
});

var marks = mongoose.model('Marks', marksSchema);
module.exports = marks;
