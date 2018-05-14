const moment = require("moment-timezone");
const request = require("request");
const log = require('../lib/log');
const logger = new log('bishijie');
const coin_news_content = require('../models/coin_news_content');
const crypto = require('crypto');
var sync = require ('../lib/sync');
const syncer = new sync();

module.exports = class bishijie {
    async fetch () {
        let now = new Date().getTime() - 1000000;
        var url = "http://www.bishijie.com/api/newsv17/index?size=50&client=pc&timestamp=" + now;
        console.log(url);

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
        this.handle(data);
        return;
    }

    async handle(body) {
        let data = JSON.parse(body);
        if (data.error != 0) {
            console.log(data.message);
            return;
        }
        let news = data.data[0].buttom;

        var param = [];
        for (let one of news) {
            var tmp = await this.parseParam(one);
            syncer.done(coin_news_content, tmp);
        }
        return true;
    }

    async parseParam(data) {
        var param = {};
        param.content = data.content;
        param.title = data.title;
        param.source = data.source;
        param.source_id = data.newsflash_id;
        param.site = 'bishijie';
        param.content_md5 = await this.md5(data.content);
        let map = ['BTC','ETH','EOS','BCH','ETC'];
        let tag = "";
        for (let coin of map) {
            if (param.title.indexOf(coin) != -1) {
                tag = tag + coin + ",";
            }
        }
        if (tag.substr(-1) == ",") {
            param.tags = tag.substring(0, tag.length - 1);
        }

        let published_at = data.issue_time * 1000;
        published_at = moment(published_at).tz("Asia/Shanghai");
        param.published_at = published_at.format('YYYY-MM-DD HH:mm:ss');
        return param;
    }

    async md5(str) {
        let md5 = crypto.createHash('md5');
        md5.update(str);
        return md5.digest('hex');
    }
}
