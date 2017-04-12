var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var Schema = mongoose.Schema;
var studSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    regno: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true
    },
    courses: [{
        courseName: String,
        courseCode: String,
        courseFaculty: String,
        facultyId: String,
        courseSlot: String,
        courseSemester: String
    }]
});

studSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
studSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};

var student = mongoose.model('StudentData', studSchema);
module.exports = student;
