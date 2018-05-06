const moment = require("moment-timezone");
const env_conf = require('../env');
const log = require('./log');
const logger = new log('sync');

module.exports = class sync {
    async done(model, info) {
        try {
            let location = {};
            for (let key of model.unique) {
                location[key] = info[key]
            }
            if(!location) {
                logger.custom('sync异常');
                throw new Error('location empty');
            }
            let instance = await model.findOne({
                where: location
            });

            if (!instance) {
                info.created_at = moment().tz("Asia/Shanghai");
                info.updated_at = moment().tz("Asia/Shanghai");
                instance = await model.create(info);
            } else {
                info.updated_at = moment().tz("Asia/Shanghai");
                let result = await instance.update(info);
            }
            return instance;
        } catch (err) {
            logger.custom('sync错误：' + err);
            return null;
        }
    }

    async update (instance) {
        try {
            instance.updated_at = moment().tz("Asia/Shanghai");
            await instance.save();
        } catch (err) {
            logger.custom("对象:" + instance._modelOptions.tableName);
        }
    }
};
