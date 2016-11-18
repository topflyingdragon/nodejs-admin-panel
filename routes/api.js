var mongoose= require('mongoose');
var User    = require('../models/user');
var Folder  = require('../models/folder');
var File    = require('../models/file');
var Message = require('../models/message');
var fs      = require('fs');
var base64  = require('base-64');

function getFolderPath(userId, folderId){
    var path = __dirname + "/../public/" + userId + "/" + folderId;
    return path;
}
function createFolder(userId, folderId){
    var path1 = __dirname + "/../public/" + userId;
    var path2 = __dirname + "/../public/" + userId + "/" + folderId;

    try{
        if (!fs.existsSync(path1)) fs.mkdirSync(path1);
    }catch(e){ console.log(e); }

    try{
        if (!fs.existsSync(path2))fs.mkdirSync(path2);
    }catch(e){ console.log(e); }
}
module.exports = function(app) {
    /*******************************************************************************************************************
     *
     */
    app.use('/api/app/getSystemData', function(req, res){
        var result = {
            Adobe_ClientId: '98ae6994e64843f1bc3ee9acf8d18f01',
            Adobe_ClientSecret : '3bf2a108-e16b-4b22-85e1-f970467e1c26'
        }
        out_json(res, 200, result);
    });
    /*******************************************************************************************************************
     *                                          Add New User
     */
    app.use('/api/user/add',function(req, res){
        addNewUser(req, res);
    });
    var addNewUser = function(req, res, idStr){
        var user = new User();
        if(idStr){
            user._id = mongoose.mongo.ObjectId(idStr);
        }
        user.firstName = "";
        user.lastName = "";
        user.name = "";
        user.city = "";
        user.friends = [];
        user.folderCount = 0;
        user.fileCount = 0;
        user.save();
        try{
            out_json(res, 200, user);
        }catch(e){
            console.log(e);
            out_error(res, 500, "folder error");
        }
    }
    /*******************************************************************************************************************
     *                                          Get User Info
     * Method: GET/POST  prameter: userId
     */
    app.use('/api/user/get', function(req, res) {
        var params = getParamenter(req);
        var userId = params.userId;
        User.findOne({_id: userId}, function(error, user){
            if(user){
                out_json(res, 200, user);
            }else{
                addNewUser(req, res, userId);
            }
        });
    });
    /*******************************************************************************************************************
     *                                          Update User Info
     * params: userId, userName
     */
    app.use('/api/user/update', function(req, res){
        var params = getParamenter(req);
        var userId = params.userId;
        var firstName = params.firstName;
        var lastName = params.lastName;
        var city = params.city;

        User.findOne({_id: userId},function(error, user){
            if(!user){
                out_error(res, 404, "User not found");
            }else{
                if(params.photoData){
                    var fullData = base64.decode(params.photoData);
                    var filePath = __dirname + "/../public/photo/" + userId + ".jpg";
                    fs.writeFile(filePath, fullData, 'binary', function(err){
                    });
                }
                user.firstName = firstName;
                user.lastName = lastName;
                user.name = firstName+" "+lastName;
                user.city = city;
                user.save(function(error, user){
                    if(error){
                        out_error(res, 500, "update error");
                    }else{
                        out_json(res, 200, user);
                    }
                });
            }
        });
    });
    /*******************************************************************************************************************
     *                                          Get User Info
     * Method: GET/POST  prameter: userIds
     */
    app.use('/api/user/listByIds', function(req, res) {
        var params = getParamenter(req);
        var userIds = params.userIds.split(",");
        User.find({_id: {$in : userIds}}, function(error, userList){
            if(userList){
                out_json(res, 200, userList);
            }else{
                out_error(res, 404, "User not found.");
            }
        });
    });
    /*******************************************************************************************************************
     *                                          Search User List
     * Method: GET/POST  prameter: userName
     */
    app.use('/api/user/search', function(req, res) {
        var params = getParamenter(req);
        var userName = params.userName || "";

        User.find({name: new RegExp( ".*"+userName+".*")}, function(error, userList){
            if(userList){
                out_json(res, 200, userList);
            }else{
                out_error(res, 404, "User not found.");
            }
        });
    });

    /*******************************************************************************************************************
     *                                              Add Friend
     * parameter: userId, friendId
     */
    app.use('/api/user/addFriend', function(req, res) {
        var params = getParamenter(req);
        var userId = params.userId;
        var friendId = params.friendId;
        User.findOne({_id: userId}, function(error, user){
            if(error || !user) return out_error(res, 404, "User not found.");

            User.findOne({_id: friendId}, function(error, friend){
                if(error || !friend) return out_error(res, 404, "Friend not found.");

                var alreadyReg = false;
                for(var i=0; i<user.friends.length; i++){
                    var id1 = user.friends[i].toHexString();
                    var id2 = friend._id.toHexString();
                    if(id1==id2){
                        alreadyReg = true; break;
                    }
                }
                if(!alreadyReg){
                    user.friends.push(friend._id);
                    user.save();
                    friend.friends.push(user._id);
                    friend.save();

                    out_json(res, 200, friend);
                }else{
                    out_json(res, 200, friend);
                }
            });
        });
    });
    /*******************************************************************************************************************
     *                                              Remove Friend
     * parameter: userId, friendId
     */
    app.use('/api/user/removeFriend', function(req, res) {
        var params = getParamenter(req);
        var userId = params.userId;
        var friendId = params.friendId;
        User.findOne({_id: userId}, function(error, user){
            if(!user) return out_error(res, 404, "User not found.");

            user.friends.splice(user.friends.indexOf(friendId),1);
            user.save();
            out_json(res, 200, user);
        });
    });
    /*******************************************************************************************************************
     *                                              Get Friends
     * parameter: userId
     */
    app.use('/api/user/getFriends', function(req, res){
        var params = getParamenter(req);
        var userId = params.userId;
        User.findOne({_id: userId}, function(error, user){
            if(!user) return out_error(res, 404, "User not found.");

            var idObjs = makeObjIdArray(user.friends);
            User.find({_id:{$in: idObjs}}, function(error, list){
                if(error || (!list)) return out_error(res, 404, "Friend not found.");

                out_json(res, 200, list);
            });
        });
    });
    /*******************************************************************************************************************
     *                                          Add Folder
     * Method: GET/POST
     * Paramenter: userId, folderName, localId, shareUserIds
     */
    app.use('/api/folder/add', function(req, res) {
        var params = getParamenter(req);
        var userId = params.userId;
        var folderName = params.folderName;
        var localId = params.localId;
        var shareUserIds = params.shareUserIds || "";
        User.findOne({_id:userId}, function(error, user){
            if(user){
                Folder.findOne({localId:localId}, function(err, folder){
                    if(err){
                        out_error(res, 500,"Server error");
                        return;
                    }
                    if(!folder){
                        folder = new Folder();
                        createFolder(userId, folder._id);

                        user.folderCount++;
                        user.save();
                    }
                    folder.userId = userId;
                    folder.name = folderName;
                    folder.localId = localId;
                    folder.status = 1;
                    folder.fileCount = 0;
                    File.remove({folderId: folder._id});

                    var newUsers = shareUserIds.split(",");
                    for(var i=0; i<newUsers.length; i++){
                        var isAdded = false;
                        for(var j=0; j<folder.shareUsers.length; j++){
                            if(newUsers[i]==folder.shareUsers[j]) {
                                isAdded = true;
                                break;
                            }
                        }
                        if(!isAdded){
                            folder.shareUsers.push(newUsers[i]);
                        }
                    }
                    folder.save();

                    out_json(res, 200, folder);
                });
            }else{
                out_error(res, 404,"User not found");
            }
        });
    });
    /*******************************************************************************************************************
     *                                                  Add File
     * Method GET/POST
     * Paramenter: userId, folderId, fullImage, localId
     */
    app.post('/api/file/add', function(req, res){
        var params = getParamenter(req);
        var localId = params.localId;
        File.findOne({localId: localId}, function(err, file){
            if(err){
                out_error(res, 500,"Server error");
                return;
            }
            if( file && (file.folderId == params.folderId) ) {
                out_json(res, 200, file);
                return;
            }
            //-------------------------  add new file
            var file = new File();
            file.userId = params.userId;
            file.folderId = params.folderId;
            file.localId = params.localId;
            file.save();

            var filePath = getFolderPath(file.userId, file.folderId) + "/" + file._id + ".jpg";
            User.findOne({_id:params.userId}, function(error, user){
                if(user){
                    user.fileCount++;
                    user.save();
                }
            });
            var fullData = base64.decode(params.fullImage);
            fs.writeFile(filePath, fullData, 'binary', function(err){
                if(err) return out_error(res, 500, "file save error");
                Folder.findOne({_id:params.folderId}, function(error, folder){
                    if(!error){
                        if(!folder.fileCount) folder.fileCount==0;
                        folder.fileCount++;
                        folder.save();
                    }
                    out_json(res, 200, file);
                });
            });
        });
    });
    /*******************************************************************************************************************
     *                                          Share Folder
     *Parameter : folderId, status
     */
    app.use('/api/folder/share', function(req, res){
        var params = getParamenter(req);
        var folderId = params.folderId;
        var status = params.status;
        Folder.findOne({_id: folderId}, function(error, folder){
            if(error) return  out_error(res, 404,"Folder not found");

            folder.status = status;
            folder.save();
            out_json(res, 200, folder);
        });
    });
    /*******************************************************************************************************************
     *                                                  Add File
     * Method GET/POST
     * Paramenter: folderId
     */
    app.use('/api/folder/get', function(req, res){
        var params = getParamenter(req);
        var folderId = params.folderId;
        Folder.findOne({_id: folderId}, function(error, folder){
            if(!folder) return  out_error(res, 404, "Folder not found");
            out_json(res, 200, folder);
        });
    });
    /*******************************************************************************************************************
     *                                                  Add File
     * Method GET/POST
     * Paramenter: localId
     */
    app.use('/api/folder/getWithLocalId', function(req, res){
        var params = getParamenter(req);
        var localId = params.localId;
        Folder.findOne({localId: localId}, function(error, folder){
            if(!folder) return  out_error(res, 404, "Folder not found");
            out_json(res, 200, folder);
        });
    });
    /*******************************************************************************************************************
     *                                                  Add File
     * Method GET/POST
     * Paramenter: localId
     */
    app.use('/api/folder/getOwner', function(req, res){
        var params = getParamenter(req);
        var localId = params.localId;
        Folder.findOne({localId: localId}, function(error, folder){
            if(!folder) return  out_error(res, 404, "Folder not found");
            User.findOne({_id: folder.userId}, function(err, user){
                if(user){
                    out_json(res, 200, user);
                }else{
                    out_error(res, 404, "User Info not found");
                }
            });
        });
    });
    /*******************************************************************************************************************
     *                                          Update Folder
     *Parameter : folderId, folderName
     */
    app.use('/api/folder/changeName', function(req, res){
        var params = getParamenter(req);
        var folderId = params.folderId;
        var name = params.folderName;
        Folder.findOne({_id: folderId}, function(error, folder){
            if(error) return  out_error(res, 404, "Folder not found");

            folder.name = name;
            folder.save();

            out_json(res, 200, folder);
        });
    });
    /*******************************************************************************************************************
     *                                          Get User's Folders
     * Param : userId
     */
    app.use('/api/folder/getUserFolders', function(req, res) {
        var params = getParamenter(req);
        var userId = params.userId;
        Folder.find({userId:userId}, function(error, list){
            if(list){
                out_json(res, 200, list);
            }else{
                out_error(res, 404, "Folder not found");
            }
        });
    });
    /*******************************************************************************************************************
     *                                          Get Other's Folders
     * Param : userId
     */
    app.use('/api/folder/getOthersSharedFolders', function(req, res) {
        var params = getParamenter(req);
        var userId = params.userId;
        User.findOne({_id:userId}, function(error, user){
            if(error || (!user)) return out_error(res, 500, "user not found");

            var friends = user.friends;
            if(!friends) friends = [];
            Folder.find({status:1, userId:{$in:friends}}, function(error, list){
                if(error) return out_error(res, 404, "folders not found");

                out_json(res, 200, list);
            });
        });
    });

    /*******************************************************************************************************************
     *                                              Move File
     * parameter: fileId, folderId
     */
    app.post('/api/file/move', function(req, res){
        var params = getParamenter(req);
        var fileId = params.fileId;
        var folderId = params.folderId;
        File.findOne({_id: fileId}, function(error, file){
            if(error || !(file)) return out_error(res, 404, "File not found");

            file.folderId = folderId;
            file.save();
            out_json(res, 200, file);
        });
    });
    /*******************************************************************************************************************
     *                                              Get File List
     * parameter: folderIds : "id1,id2,...,idn"
     */
    app.use('/api/file/getList', function(req, res){
        var params = getParamenter(req);
        var ids = params.folderIds.split(",");
        File.find({folderId:{$in:ids}}, function(error, list){
            if(error){
                out_error(res, 500, "Server error");
            }else{
                out_json(res, 200, list);
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
