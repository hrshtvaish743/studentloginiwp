var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var ttSchema = new Schema({
    semester: {
        type: String,
        required: true
    },
    regno: {
        type: String,
        required: true
    },
    slots: {
        type: [Number],
        required: true
    },
    courses: {
        type: Object
    }
});

var timetable = mongoose.model('TimeTable', ttSchema);
module.exports = timetable;
