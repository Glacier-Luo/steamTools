var express = require('express');
var router = express.Router();
var Db = require('../utils/db');
db = new Db();
var Utils = require('../utils');
var SteamTotp = require('steam-totp');


router.get('/test', function (req, res, next) {
    console.log(req.body);
    res.status(200).jsonp({"status": 200, "data": "ok!"})
});

//{"data":[{"username":"a","password":"b","secretKet":"c"},{"username":"b","password":"c","secretKet":"d"}]}
router.post('/jsonImport', function (req, res, next) {
    console.log(req.body);
    let list = req.body.data;
    for (let i = 0; i < list.length; i++) {
        let data = list[i];
        console.log(data.username);
        db.createUser({username: data.username, password: data.password, secretKey: data.secretKey});
        // steam.logOn(data.username, data.password, data.code);
        // steam.getBalance.then(function (val) {
        //     db.createUser({username: data.username, password: data.password, secretKey: data.secretKey, balance: val})
        //
        // });
    }
    // console.log(i)
    res.status(200).jsonp({"status": 200, "data": "ok!"});
});

router.post('/jsonExport', function (req, res, next) {
    let users = db.steamUser.findAll({include: [{all: true}]});
    users.then(resolveResult => {
        let existingItem = resolveResult;
        console.log( "existingItem : ");
        console.log( JSON.stringify(existingItem) );
        res.status(200).jsonp(JSON.stringify(existingItem));
    });
});

router.post('/refreshBalance', function (req, res, next) {
    let users = db.steamUser.findAll({include: [{all: true}]});
    (async ()=> {
        await users.then(resolveResult => {
            for(let i = 0;i < resolveResult.length;++i){
                let steam = new Utils();
                steam.logOn(resolveResult[i].username, resolveResult[i].password, resolveResult[i].secretKey);
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
            }
        });
    })();
    res.status(200).jsonp({"status": 200, "data": "正在更新数据!"});
});

module.exports = router;
