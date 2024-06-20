const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Clientes = require('./clientes');
const Consultores = require('./consultores');

class Feedback extends Model {}

Feedback.init({
    titulo: {
        type: DataTypes.STRING,
        allowNull: false
    },
    data: {
        type: DataTypes.DATE,
        allowNull: false
    },
    clienteId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Clientes,
            key: 'id'
        }
    },
    consultorId: {
        type: DataTypes.INTEGER,
        allowNull: false, // Permitir valores nulos inicialmente
        references: {
            model: Consultores,
            key: 'id'
        }
    },
    texto: {
        type: DataTypes.TEXT,
        allowNull: false
    }
}, {
    sequelize,
    modelName: 'Feedback',
    tableName: 'feedback',
    freezeTableName: true
});

Clientes.hasMany(Feedback, { foreignKey: 'clienteId' });
Consultores.hasMany(Feedback, { foreignKey: 'consultorId' });
Feedback.belongsTo(Clientes, { foreignKey: 'clienteId' });
Feedback.belongsTo(Consultores, { foreignKey: 'consultorId' });

module.exports = Feedback;
