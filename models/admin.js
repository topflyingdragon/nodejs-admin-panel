
var mongoose = require('mongoose');

// define the schema for our user model
var adminSchema = mongoose.Schema({
    userId: String,
    password: String,
    updated: { type: Date, default: Date.now },
});

// checking if password is valid
adminSchema.methods.validPassword = function(password) {
    // something
    return true;
};

// create the model for users and expose it to our app
module.exports = mongoose.model('Admin', adminSchema);
