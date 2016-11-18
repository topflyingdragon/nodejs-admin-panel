
var mongoose = require('mongoose');

// define the schema for our user model
var userSchema = mongoose.Schema({
    firstName: String,
    lastName: String,
    name: String,
    city: String,
    folderCount: Number,
    fileCount: Number,
    friends: Array,
    updated: { type: Date, default: Date.now },
});

// checking if password is valid
userSchema.methods.validPassword = function(password) {
    // something
    return true;
};

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);
