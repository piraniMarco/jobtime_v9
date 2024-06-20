const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Certifique-se de que o caminho está correto
const Clientes = require('./clientes');
const Consultores = require('./consultores');

class Consultoria extends Model {
    get totalValor() {
        const horaInicio = new Date(`1970-01-01T${this.horaInicio}Z`);
        const horaFim = new Date(`1970-01-01T${this.horaFim}Z`);
        const horasTrabalhadas = (horaFim - horaInicio) / 3600000 - this.intervalo;
        return horasTrabalhadas * this.valorHora;
    }
}

Consultoria.init({
    data: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    horaInicio: {
        type: DataTypes.TIME,
        allowNull: false
    },
    horaFim: {
        type: DataTypes.TIME,
        allowNull: false
    },
    intervalo: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    valorHora: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    clienteId: {
        type: DataTypes.INTEGER,
        references: {
            model: 'Clientes', // Alterado
            key: 'id'
        }
    },
    consultorId: {
        type: DataTypes.INTEGER,
        references: {
            model: 'Consultores', // Alterado
            key: 'id'
        }
    }
    
}, {
    sequelize,
    modelName: 'Consultoria',
    getterMethods: {
        totalValor() {
            const horaInicio = new Date(`1970-01-01T${this.horaInicio}Z`);
            const horaFim = new Date(`1970-01-01T${this.horaFim}Z`);
            const horasTrabalhadas = (horaFim - horaInicio) / 3600000 - this.intervalo;
            return horasTrabalhadas * this.valorHora;
        }
    }
});

// Definindo associações
Consultoria.belongsTo(Clientes, { foreignKey: 'clienteId' });
Consultoria.belongsTo(Consultores, { foreignKey: 'consultorId' });

Consultoria.sync({ alter: true }).then(() => {
    console.log("Tabela 'Consultoria' criada ou atualizada no banco de dados");
}).catch(err => {
    console.error("Erro ao sincronizar modelo com o banco de dados:", err);
});

module.exports = Consultoria;
