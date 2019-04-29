//process.env.SECRET_KEY
const crypto = require('crypto');
function myCrypto(){
    this.aesEncrypto = function (data) {
        const cipher = crypto.createCipher('aes192', process.env.SECRET_KEY);
        var crypted = cipher.update(data, 'utf8', 'hex');
        crypted += cipher.final('hex');
        return crypted;
    };

    this.aesDecrypto = function (encrypted) {
        const decipher = crypto.createDecipher('aes192', process.env.SECRET_KEY);
        var decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    };

    this.sha256Encrypto = function (data) {
        const hmac = crypto.createHmac('sha256', process.env.SECRET_KEY);
        hmac.update(data);
        return hmac.digest('hex');
    }
}

module.exports = myCrypto;