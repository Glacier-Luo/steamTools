const SteamUser = require('steam-user');
var SteamTotp = require('steam-totp');
function utils() {
    let steamClient = new SteamUser();
    this.logOn = function (username, password, code) {
        steamClient.logOn({
            accountName: username,
            password: password,
            twoFactorCode: SteamTotp.generateAuthCode(code),
            rememberPassword: false,
            dontRememberMachine: true,
        });
    };

    this.getBalance = new Promise(function (resolve, reject) {
        var myBalance;
        steamClient.on('wallet', function (hasWallet, currency, balance) {
            myBalance = SteamUser.formatCurrency(balance, currency);
            // console.log("Our wallet balance is " + myBalance);
            if (myBalance) {
                console.log('resolve!');
                resolve(myBalance);
            }
        });
    });
}

module.exports = utils;