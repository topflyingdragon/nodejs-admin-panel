//----------------------------------------------------------------------------------------------------------------------
//                                                Load Moduels
//----------------------------------------------------------------------------------------------------------------------
var config 		= require('./config/config');
var http   		= require("http");
var express     = require('express');
var session	    = require('express-session');
var ejs         = require('ejs');
var bodyParser  = require('body-parser');
var mongoose    = require('mongoose');
var fs          = require('fs'); // for filesystem operations
var path        = require('path'); // for relative paths
var open        = require('open');
//----------------------------------------------------------------------------------------------------------------------
mongoose.connect(config.dbUrl);
//----------------------------------------------------------------------------------------------------------------------
//                                                 Define Route
//----------------------------------------------------------------------------------------------------------------------
var app = express();
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: {maxAge: 30*60*1000} // 30min
}));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

app.set('views', 'view');
app.set('view engine', 'ejs');

app.use(express.static(__dirname + '/public'));

require('./routes/api')(app);
require('./routes/message')(app);
require('./routes/admin_panel')(app);

app.listen(config.APP_PORT, function () {
    console.log('Express server listening on port ' + config.APP_PORT);
    //open('http://localhost:'+config.APP_PORT, 'chrome');
});

//http.createServer(app).listen(config.APP_PORT, function() {
//    console.log('Express server listening on port ' + app.get('port'));
//});
