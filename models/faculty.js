var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var Schema = mongoose.Schema;
var facultySchema = new Schema({
    name: {
        type: String,
        required: true
    },
    empid: {
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
    tokens: [{
        course: String,
        token: String,
        type : {
          type : String
        }
    }],
    courses : [
      {
        name : String,
        code : String,
        slot : String,
        venue : String,
        type : {
          type : String
        },
        marksSplitUp : [
          {
            component : {
              type : String
            },
            maxMarks : {
              type : Number
            },
            scoredMarks : {
              type : Number
            }
          }
        ]
      }
    ]
});

facultySchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
facultySchema.methods.validPassword = function(password) {
    console.log(password);
    return bcrypt.compareSync(password, this.password);
};

var faculty = mongoose.model('FacultyData', facultySchema);
module.exports = faculty;
