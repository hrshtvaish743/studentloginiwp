var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var Schema = mongoose.Schema;
var attendanceSchema = new Schema({
    facultyId : {
      type : String,
      required : true
    },
    courseCode: {
        type: String,
        required: true
    },
    slot: {
        type: String,
        required: true
    },
    date : {
      type : String,
      required : true
    },
    attendance : [
      {
        regno: {
            type: String,
            required: true
        },
        present: {
            type: Boolean,
            required: true
        }
      }
    ]
});

var attendance = mongoose.model('Attendance', attendanceSchema);
module.exports = attendance;
