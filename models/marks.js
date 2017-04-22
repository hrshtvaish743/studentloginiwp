var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var Schema = mongoose.Schema;
var marksSchema = new Schema({
    regno: {
        type: String,
        required: true
    },
    courseCode: {
        type: String,
        required: true
    },
    marks: {
        type: String
    },
    exam : {
      type : String
    }
});

var marks = mongoose.model('Marks', marksSchema);
module.exports = marks;
