const moment = require("moment-timezone");
const cheerio = require("cheerio");
const log = require('../lib/log');
const logger = new log('bzh');
const coin_news_content = require('../models/coin_news_content');
var sync = require ('../lib/sync');
const syncer = new sync();
var util = require ('./util');
const utiler = new util();

module.exports = class bzh {
    async fetch () {
        let now = new Date().getTime() - 1000000;
        let url = "https://www.bizhihui.vip/api/article/list?type=hot&quality=superior&size=30&uid=23B8CB7C-D3C5-430E-A8DB-F4F1804C409E&ts=" + now;
        console.log(url);
        let data = await utiler.download(url);
        await this.handle(data);
        return true;
    }

    async handle(body) {
        let data = JSON.parse(body);
        if (data.count < 1) {
            return;
        }
        let news = data.items;
        var param = [];
        for (let one of news) {
            var tmp = await this.parseParam(one);
            syncer.done(coin_news_content, tmp);
        }
        return true;
    }

    async parseParam(data) {
        var param = {};
        param.title = data.title;
        let id = data.article_id;
        param.summary = data.abstract;
        param.source = data.site;
        param.url = "https://www.bizhihui.vip/article/" + id;
        param.site = 'bizhihui';
        // param.content_md5 = await utiler.md5(param.content);
        let tag = "";
        for (let one of data.tags) {
            tag = tag + one + ",";
        }
        if (tag.substr(-1) == ",") {
            param.tags = tag.substring(0, tag.length - 1);
        }

        let published_at = data.publish_time;
        published_at = moment(published_at).tz("Asia/Shanghai");
        param.published_at = published_at.format('YYYY-MM-DD HH:mm:ss');
        return param;
    }

    async queryContent () {
        let data = await coin_news_content.findAll({
            where: {
                'site': 'bizhihui',
                'status': 0,
            },
        });
        return data;
    }

    async update (id, content, content_md5) {
        var ret = await coin_news_content.update({
            'content': content,
            'content_md5': content_md5,
            'status' : 1,
        },
        {
            'where': {
                'id':id,
            }
        });
    }

    async fetch_content () {
        let data = await this.queryContent();
        if (!data) {
            return true;
        }
        for (let one of data) {
            let url = one.url + "?uid=5af4715dc48334296c9a94df";
            url = url.replace("https://www.bizhihui.vip/", "https://www.bizhihui.vip/api/");
            let content_json = await utiler.download(url);
            let id = one.id;
            let content = JSON.parse(content_json);
            if (content.result.length < 1) {
                break;
            }
            let html = content.result.html;
            console.log(id);
            if (html.length > 0) {
                let content_md5 = await utiler.md5(html);
                await this.update(id, html, content_md5);
            }
        }
        return true;
    }
}
