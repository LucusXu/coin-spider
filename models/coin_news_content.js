const Sequelize = require('sequelize');
const dbStroage = require('../lib/db');

const model = dbStroage.define('coin_news_content', {
    'title': Sequelize.STRING,
    'summary': Sequelize.STRING,
    'url': Sequelize.STRING,
    'content': Sequelize.STRING,
    'source': Sequelize.STRING,
    'tags': Sequelize.STRING,
    'site': Sequelize.STRING,
    'source_id': Sequelize.STRING,
    'content_md5': Sequelize.STRING,
    'published_at': Sequelize.DATE,
}, {
    tableName: 'coin_news_content',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: false,
});

model.unique = ['title'];

module.exports = model;
