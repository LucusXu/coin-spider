const schedule = require('node-schedule');
const config = require('../../conf/crontab');
const log = require('../../lib/log');
const logger = new log('bizhihui');
const work = require('../../work/bzh');
const worker = new work();
const sync = require('../../lib/sync');

// let sleep = (ms) => new Promise (resolve => setTimeout (resolve, ms));
schedule.scheduleJob(config.bzh_content, function () {
    (async () => {
        let name = 'news-spider-bzh-content';
        console.log(name);
        logger.custom(name + "执行开始");
        worker.fetch_content();
    }) ()
});

process.on('uncaughtException', function (err) {
    logger.custom("异常:" + err);
});
