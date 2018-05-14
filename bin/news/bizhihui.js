const log = require('../../lib/log');
const logger = new log('bizhihui');
const work = require('../../work/bzh');
const worker = new work();
const sync = require('../../lib/sync');

let sleep = (ms) => new Promise (resolve => setTimeout (resolve, ms));
(async () => {
    let name = 'news-spider-bizhihui';
    console.log(name);
    logger.custom(name + "启动");
    while(true) {
        logger.custom(name + "执行开始");
        await worker.fetch();
        await sleep (300000);
    }
}) ()

process.on('uncaughtException', function (err) {
    logger.custom("异常:" + err);
});
