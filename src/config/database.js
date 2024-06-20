const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('jobtime_V9', 'root', '', {
    host: 'localhost',
    dialect: 'mysql',
});

module.exports = sequelize;
