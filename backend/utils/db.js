var Sequelize = require('sequelize');
const Settings = require('../config/' + process.env.BUILD_ENV + '.config');
var Crypto = require('../utils/crypto');
var crypto = new Crypto();
var sequelize = new Sequelize(Settings.DATABASE, Settings.USERNAME, Settings.PASSWORD,
    {
        host: Settings.HOST, dialect: Settings.DIALECT, define: {underscored: false}
    }
);
var steamUser = sequelize.define('steamUser', {
    id: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
    username: {type: Sequelize.STRING, allowNull: false, unique: true},
    password: {type: Sequelize.TEXT, allowNull: false},
    secretKey: {type: Sequelize.TEXT, allowNull: false},
    balance: Sequelize.DOUBLE
});

var user = sequelize.define('user',{
    id: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
    username: {type: Sequelize.STRING, allowNull: false, unique: true},
    password: {type: Sequelize.TEXT, allowNull: false},

});

function db() {
    this.sequelize = sequelize;

    this.steamUser = steamUser;
    this.user = user;
    this.createSteamUser = function (userInfo) {
        steamUser.sync({alter: true}).then(function () {
            return steamUser.create(userInfo);
        })
    };

    this.bulkCreateSteamUsers = function (userinfo) {
        for(var i = 0; i < userinfo.length;++i){
            userinfo[i].password = crypto.aesEncrypto(userinfo[i].password);
            userinfo[i].secretKey = crypto.aesEncrypto(userinfo[i].secretKey);
        }
        steamUser.sync({alter: true}).then(function () {
            return steamUser.bulkCreate(userinfo);
        })
    };

    // this.findAllSteamUsers = new Promise(function (resolve, reject) {
    //     let users = steamUser.findAll({include: [{all: true}]});
    //     users.then(resolveResult => {
    //         for (let i = 0; i < resolveResult.length; ++i) {
    //             resolveResult[i].password = crypto.aesDecrypto(resolveResult[i].password);
    //             resolveResult[i].secretKey = crypto.aesDecrypto(resolveResult[i].secretKey);
    //         }
    //         // console.log(JSON.stringify(resolveResult));
    //         // return JSON.stringify(resolveResult);
    //         if(resolveResult){
    //             console.log('resolve!');
    //             resolve(JSON.stringify(resolveResult));
    //         }
    //     });
    // });
    // this.findAllSteamUsers = function () {
    //     // console.log('喵喵喵？');
    //     let users = steamUser.findAll({include: [{all: true}]});
    //     users.then(resolveResult => {
    //         for (let i = 0; i < resolveResult.length; ++i) {
    //             resolveResult[i].password = crypto.aesDecrypto(resolveResult[i].password);
    //             resolveResult[i].secretKey = crypto.aesDecrypto(resolveResult[i].secretKey);
    //         }
    //         // console.log(JSON.stringify(resolveResult));
    //         return JSON.stringify(resolveResult);
    //     });
    // }
}

module.exports = db;