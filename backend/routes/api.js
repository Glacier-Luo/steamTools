var express = require('express');
var router = express.Router();
var Db = require('../utils/db');
var db = new Db();
var Utils = require('../utils');
var Crypto = require('../utils/crypto');
var crypto = new Crypto();
var Domain = require('domain');
var jwt = require('express-jwt');
var jsonwebtoken = require('jsonwebtoken');


router.get('/test', function (req, res, next) {//这里会自动创建一个req.user
    console.log(req.body);
    console.log(req.user);
    res.status(200).jsonp({"status": 200, "data": "ok!"})
});


//{"data":[{"username":"a","password":"b","secretKet":"c"},{"username":"b","password":"c","secretKet":"d"}]}
router.post('/jsonImport', function (req, res, next) {
    console.log(req.body);
    let list = req.body.data;
    let data = [];
    for (let i = 0; i < list.length; i++) {
        let temp = list[i];
        console.log(temp.username);
        data.push({username: temp.username, password: temp.password, secretKey: temp.secretKey});
        // db.createSteamUser({username: data.username, password: data.password, secretKey: data.secretKey});
    }
    db.bulkCreateSteamUsers(data);
    // console.log(i)
    res.status(200).jsonp({"status": 200, "data": "ok!"});
});

router.post('/jsonExport', function (req, res, next) {
    let users = new Promise(function (resolve, reject) {
        let users = db.steamUser.findAll({include: [{all: true}]});
        users.then(resolveResult => {
            for (let i = 0; i < resolveResult.length; ++i) {
                resolveResult[i].password = crypto.aesDecrypto(resolveResult[i].password);
                resolveResult[i].secretKey = crypto.aesDecrypto(resolveResult[i].secretKey);
            }
            // console.log(JSON.stringify(resolveResult));
            // return JSON.stringify(resolveResult);
            if (resolveResult) {
                console.log('resolve!');
                resolve(JSON.stringify(resolveResult));
            }
        });
    });
    users.then(function (value) {
        res.jsonp(value);
    });
    // res.jsonp(users);
    // let users = db.steamUser.findAll({include: [{all: true}]});
    // users.then(resolveResult => {
    //     let existingItem = resolveResult;
    //     console.log("existingItem : ");
    //     console.log(JSON.stringify(existingItem));
    //     res.status(200).jsonp(JSON.stringify(existingItem));
    // });
});

router.post('/refreshBalance', function (req, res, next) {
    var domain = Domain.create();
    domain.on('error', function (err) {
        console.log(err);
    });
    let users = db.steamUser.findAll({include: [{all: true}]});
    (async () => {
        await users.then(resolveResult => {
            for (let i = 0; i < resolveResult.length; ++i) {
                // console.log(resolveResult[i]);
                let steam = new Utils();
                // steam.logOn(resolveResult[i].username, crypto.aesDecrypto(resolveResult[i].password), crypto.aesDecrypto(resolveResult[i].secretKey))
                domain.run(function () {
                    steam.logOn(resolveResult[i].username, crypto.aesDecrypto(resolveResult[i].password), crypto.aesDecrypto(resolveResult[i].secretKey))
                });
                domain.run(function () {
                    steam.getBalance.then(function (val) {
                        let balance = val.split(" ")[0];
                        console.log(resolveResult[i].username + "的余额为" + val);
                        resolveResult[i].update({balance: balance}).then(function () {
                            console.log(resolveResult[i].username + "的余额更新成功！");
                        }).catch(function (e) {
                            console.log(resolveResult[i].username + "的余额更新失败！");
                            console.log(e + '\n\r' + e.stack);
                        });
                    });
                });
            }
        });
    })();
    res.status(200).jsonp({"status": 200, "data": "正在更新数据!"});
});

router.post('/login', function (req, res, next) {
    console.log(req.body);
    let data = req.body;
    let user = db.user.findOne({where: {username: data.username}});
    user.then(found => {
        // console.log(found);
        if(found===null){//实际上是账户不存在
            res.status(200).jsonp({"status": 400, "data": "用户名或密码错误!"});
        }else if (found.password !== crypto.sha256Encrypto(data.password)){//这里是密码错误
            res.status(200).jsonp({"status": 400, "data": "用户名或密码错误!"});
        }else{
            let token = jsonwebtoken.sign({'username': found.username}, process.env.SECRET_KEY, {
                expiresIn: 60 * 5
            });
            res.status(200).jsonp({"status": 200, "data": "登录成功!", "token": token});
        }
        // res.status(200).jsonp({"status": 200, "data": "ok!"});
    });
});

router.post('/refreshToken', function (req, res, next) {
    let data = req.user;
    console.log(data.username);
    let token = jsonwebtoken.sign({'username': data.username}, process.env.SECRET_KEY, {
        expiresIn: 60 * 5
    });
    res.status(200).jsonp({"status": 200, "data": "更新成功!", "token": token});
});

router.post('/changePassword', function (req, res, next) {
    console.log(req.body);
    let data = req.body;
    let user = db.user.findOne({where: {username: data.username}});
    user.then(found => {
        // console.log(found);
        if(found===null){//实际上是账户不存在
            res.status(200).jsonp({"status": 400, "data": "用户名或密码错误!"});
        }else if (found.password !== crypto.sha256Encrypto(data.password)){//这里是密码错误
            res.status(200).jsonp({"status": 400, "data": "用户名或密码错误!"});
        }else{
            db.user.update({password: crypto.sha256Encrypto(data.new)},{
                where: {username: data.username, password: crypto.sha256Encrypto(data.password)}
            }).then(result =>{
                console.log(result);
            });
            res.status(200).jsonp({"status": 200, "data": "密码修改成功!"});
        }
        // res.status(200).jsonp({"status": 200, "data": "ok!"});
    });
});

module.exports = router;
