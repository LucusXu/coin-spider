const moment = require("moment-timezone");
const request = require("request");
const urlencode = require('urlencode');
const sync = require('../lib/sync');
const log = require('../lib/log');
const string = require('../lib/string');
const logger = new log('util');

module.exports = class util {
    async download (url) {
        var data = await new Promise(function (resolve, reject) {
            request.get(url, function(error, response, body) {
                if (!error && response.statusCode == 200) {
                    resolve(body);
                    console.log("200");
                } else {
                    logger.custom('下载失败，response:' + response);
                }
            });
        }.bind(this));
        return data;
    }

    async md5(str) {
        let md5 = crypto.createHash('md5');
        md5.update(str);
        return md5.digest('hex');
    }
}
