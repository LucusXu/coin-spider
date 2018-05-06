const moment = require("moment-timezone");
const request = require("request");
const log = require('../lib/log');
const logger = new log('jscj');
const coin_news_content = require('../models/coin_news_content');
const crypto = require('crypto');
var sync = require ('../lib/sync');
const syncer = new sync();
var util = require ('../util');
const utiler = new util();

module.exports = class jscj {
    async fetch () {
        let url_list = [
            'https://api.jinse.com/v4/information/list?catelogue_key=www&limit=10&information_id=0&flag=down&version=9.9.9', // 头条
            'https://api.jinse.com/v4/information/list?catelogue_key=shendu&limit=10&information_id=0&flag=down&version=9.9.9',  // 深度
            'https://api.jinse.com/v4/information/list?catelogue_key=zhuanfang&limit=10&information_id=0&flag=down&version=9.9.9', // 对话
            'https://api.jinse.com/v4/information/list?catelogue_key=fenxishishuo&limit=10&information_id=0&flag=down&version=9.9.9', // 分析
            'https://api.jinse.com/v4/information/list?catelogue_key=capitalmarket&limit=10&information_id=0&flag=down&version=9.9.9', // 投研
            'https://api.jinse.com/v4/information/list?catelogue_key=zhengce&limit=10&information_id=0&flag=down&version=9.9.9', // 政策
            'https://api.jinse.com/v4/information/list?catelogue_key=930&limit=10&information_id=0&flag=down&version=9.9.9', // 九点半
            'https://api.jinse.com/v4/information/list?catelogue_key=tech&limit=10&information_id=0&flag=down&version=9.9.9', // 技术
            'https://api.jinse.com/v4/information/list?catelogue_key=evaluation&limit=10&information_id=0&flag=down&version=9.9.9', // 评测
            'https://api.jinse.com/v4/information/list?catelogue_key=baike&limit=10&information_id=0&flag=down&version=9.9.9', // 百科
            'https://api.jinse.com/v4/information/list?catelogue_key=kuang&limit=10&information_id=0&flag=down&version=9.9.9', // 矿业
        ];
        let sleep = (ms) => new Promise (resolve => setTimeout (resolve, ms));
        for (let url of url_list) {
            let data = await utiler.download(url);
            await this.handle(data);
            sleep(5000);
        }
        return true;
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
