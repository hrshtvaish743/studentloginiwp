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
    semester: {
        type: String,
        required: true
    },
    faculties: {
        type: [String],
        required: true
    },
    slots: {
        type: String,
        required: true
    },
    credits : Number,
    type: {
        type: String,
        required: true
    },
});

var course = mongoose.model('Courses', courseSchema);
module.exports = course;
