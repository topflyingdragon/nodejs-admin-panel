
var mongoose = require('mongoose');

// define the schema for our user model
var messageSchema = mongoose.Schema({
    fromId  : String,
    toId    : String,
    cmd     : String,
    title   : String,
    detail  : String,
    data    : String,
    updated: { type: Date, default: Date.now },
});

// create the model for users and expose it to our app
module.exports = mongoose.model('Message', messageSchema);
