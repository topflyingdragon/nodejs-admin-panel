
var mongoose = require('mongoose');

// define the schema for our user model
var schema = mongoose.Schema({
    localId:    String,
    name:       String,
    userId:     String,
    createrId:  String,
    status:     Number,
    fileCount:  Number,
    shareUsers: Array,
    updated:    { type: Date, default: Date.now },
});

// create the model for users and expose it to our app
module.exports = mongoose.model('Folder', schema);
