
var mongoose = require('mongoose');

// define the schema for our user model
var schema = mongoose.Schema({
    localId: String,
    userId: String,
    folderId: String,
    fileName: String,
    updated: { type: Date, default: Date.now },
});

// create the model for users and expose it to our app
module.exports = mongoose.model('File', schema);

