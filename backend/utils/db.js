var Sequelize = require('sequelize');
const Settings = require('../config/' + process.env.BUILD_ENV + '.config');
var sequelize = new Sequelize(Settings.DATABASE, Settings.USERNAME, Settings.PASSWORD,
    {
        host: Settings.HOST, dialect: Settings.DIALECT, define: {underscored: false}
    }
);
var steamUser = sequelize.define('steamUser', {
    id: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
    username: {type: Sequelize.STRING, allowNull: false, unique: true},
    password: {type: Sequelize.STRING, allowNull: false},
    secretKey: {type: Sequelize.STRING, allowNull: false},
    balance: Sequelize.DOUBLE
});
function db() {
    this.sequelize = sequelize;

    this.steamUser = steamUser;

    this.createUser = function (userInfo) {
        steamUser.sync({alter: true}).then(function () {
            return steamUser.create(userInfo);
        })
    }
}

module.exports = db;