var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var User = new Schema({

    fname: {
        type: String,
        required: true,
      },
      lname: {
        type: String,
        required: true,
      },
      birthdate: {
        type: Date,
      },
      phone: {
        type: Number,
        required: true,
      },
      email: {
        type: String,
        required: true,
        unique: true,
      },
      password: {
        type: String,
        required: true,
      },
      isAdmin: {
        type: Boolean,
        default: false,
      },
      
});

module.exports = mongoose.model('users', User);