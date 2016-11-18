var mongoose= require('mongoose');
var User    = require('../models/user');
var Folder  = require('../models/folder');
var File    = require('../models/file');
var Message = require('../models/message');
var fs      = require('fs');
var base64  = require('base-64');

module.exports = function(app) {
    /*******************************************************************************************************************
     *                                          Add Message
     * Method: GET/POST  prameter: fromId, toIds, cmd, title, detail
     * ex: http://localhost:8000/api/message/send?fromId=1&toIds=2,3,4&cmd=test&title=someTitle&detail=
     */
    app.use('/api/message/send', function(req, res) {
        var params = getParamenter(req);
        var toIds = params.toIds.split(",");
        toIds.forEach(function(toId){
            var message = new Message();
            message.fromId = params.fromId;
            message.toId = toId;
            message.cmd = params.cmd;
            message.title = params.title;
            message.detail = params.detail;
            message.data = params.data;
            message.save();
        });
        out_json(res, 200, "");
    });
    /*******************************************************************************************************************
     *                                          Get Message
     * Method: GET/POST  prameter: toId
     * ex: http://localhost:8000/api/message/getOne?toId=2
     */
    app.use('/api/message/getOne', function(req, res) {
        var params = getParamenter(req);
        var toId = params.toId;
        Message.findOne({toId:toId}).sort({updated: 'asc'}).exec(function(err, msg){
            if(msg){
                out_json(res, 200, msg);
                msg.remove();
            }else{
                out_error(res, 404, "Message not found");
            }
        });
    });

}

function isEmptyObject(obj) {
    return !Object.keys(obj).length;
}
function getParamenter(req){
    return isEmptyObject(req.body) ? req.query : req.body;
}
function out_json(res, code, data){
    res.json({code:code, message:"Success", data: data});
}
function out_error(res, code, error){
    res.json({code:code, message:error});
}
function makeObjIdArray(ids){
    var result = [];
    ids.forEach(function(id){
        result.push(mongoose.Types.ObjectId(id));
    });
    return result;
}
