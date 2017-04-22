var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var Schema = mongoose.Schema;
var messageSchema = new Schema({
    from: {
        type: String,
        required: true
    },
    to: {
        type: String,
        required: true
    },
    date: {
        type: String
    },
    message : {
      type : String,
      required : true
    }
});

var message = mongoose.model('Message', messageSchema);
module.exports = message;
