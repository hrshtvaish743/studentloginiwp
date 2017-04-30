var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var Schema = mongoose.Schema;
var courseSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    code: {
        type: String,
        required: true
    },
    facultyName: {
        type: String,
        required: true
    },
    facultyId : {
      type : String
    },
    slot: {
        type: String,
        required: true
    },
    credits : Number,
    type: {
        type: String,
        required: true
    },
    venue : String
});

var course = mongoose.model('Courses', courseSchema);
module.exports = course;
