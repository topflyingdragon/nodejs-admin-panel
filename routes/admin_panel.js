var mongoose= require('mongoose');
var Admin   = require('../models/admin');
var User    = require('../models/user');
var Folder  = require('../models/folder');
var File    = require('../models/file');
var Message = require('../models/message');
var fs      = require('fs');
var base64  = require('base-64');
var express = require('express');
var session = require('express-session');
//-------------------------------

module.exports = function(app)
{
    app.get('/admin', function (req, res) {
        if(req.session.admin){
            res.render("index");
            //res.sendFile('index.html', { root: __dirname + "/../public" });
        }else{
            res.redirect("/admin/login");
        }
    });
    app.get("/admin/logout", function(req, res){
        delete req.session.admin;
        res.redirect("/admin/login");
    });

    app.get('/admin/login', function (req, res) {
        res.render("login");
    });

    app.post('/admin/login', function (req, res) {
        var params = getParamenter(req);
        var adminId = params.login_id;
        var password = params.password;

        var outHtml = function(){
            res.render("login");
        }

        if(!(adminId && adminId.length>0 && password && password.length)) {
            outHtml();
            return;
        }

        Admin.findOne({userId: adminId}, function(err, user){
            if(user){
                if(user.password == password){
                    req.session.admin = user;
                    req.session.save();
                    res.redirect("/admin");
                }else{
                    delete req.session.admin;
                    outHtml();
                }
            }else{
                Admin.find({}, function(err, list){
                    if(list && list.length==0){
                        var admin = new Admin();
                        admin.userId = adminId;
                        admin.password = password;
                        admin.save(function(err){
                            if(err){
                                outHtml();
                            }else{
                                session.admin = admin;
                                session.save();
                                res.redirect("/admin");
                            }
                        });
                    }else{
                        outHtml();
                    }
                });
            }
        });

    });
    app.post('/admin/changePassword', function (req, res) {
        var params = getParamenter(req);
        var cur_password = params.cur_password;
        var new_password = params.new_password;
        var admin = req.session.admin;
        var adminId = admin.userId;
        if(cur_password==admin.password){
            Admin.findOne({userId: adminId}, function(err, user){
                if(user){
                    user.password = new_password;
                    user.save(function(err){
                        if(err){
                            out_error(res, 404, "Server Error.");
                        }else{
                            out_json(res, 200, {});
                        }
                    });
                }else{
                    out_error(res, 404, "Session timeout. Please login again.");
                }
            });

        }else{
            out_error(res, 404, "Invalid Current Password");
        }
    });

    app.get('/admin/userList', function(req,res){
        User.find({}, function(error, list){
            if(list){
                out_json(res, 200, list);
            }else{
                out_error(res, 404, "Users not found");
            }
        });
    });

    app.post('/admin/clearUserName', function(req, res){
        var params = getParamenter(req);
        var userId = params.userId;
        User.findOne({_id: userId}, function(err, user){
            if(user){
                user.firstName = "";
                user.lastName = "";
                user.name = "";
                user.save();

                out_json(res, 200, user);
            }else{
                out_error(res, 404, "Users not found");
            }
        });
    });
}

//------------------------------------
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
