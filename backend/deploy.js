var isWin = /^win/.test(process.platform);
// console.log(isWin);
var exec = require('child_process').exec;
var keygen = 'openssl rand -hex 32';
let key = '';
if(process.env.SECRET_KEY){
    console.log('SECRET_KEY已存在！');
    console.log(process.env.SECRET_KEY);
    return;
}
exec(keygen, function(err,stdout,stderr){
    if(err) {
        console.log('error:'+stderr);
    } else {
        key = stdout;
        console.log(key);
        console.log("请务必保密记下上方字符串， 否则可能造成数据丢失！");
        if(isWin){
            var cmd = 'setx SECRET_KEY ' + key;
            // var cmd = 'set SECRET_KEY=' + key;
            exec(cmd, function (err, stdout, stderr) {
                if(err){
                    console.log('error:'+stderr)
                }else{
                    console.log(stdout);
                    console.log('已成功写入环境变量！');
                }
            })
        }else{// todo:linux平台可能有bug， 需多次测试
            var shell = 'echo "export SECRET_KEY=' + key + '" >> /etc/profile';
            exec(shell, function (err, stdout, stderr) {
                if(err){
                    console.log('error:'+stderr)
                }else{
                    console.log(stdout);
                    console.log('已成功写入环境变量！');
                }
            })
        }
    }
});