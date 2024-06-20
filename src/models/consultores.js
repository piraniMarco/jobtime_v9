const { Sequelize, DataTypes } = require('sequelize');
const connection = require('../config/database'); // Certifique-se de que o caminho está correto

const Consultores = connection.define('Consultores', {
    nome: {
        type: DataTypes.STRING,
        allowNull: false
    },
    endereco: {
        type: DataTypes.STRING,
        allowNull: false
    },
    telefone: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true // Validação de e-mail
        }
    },
    login: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    senha: {
        type: DataTypes.STRING,
        allowNull: false
    },
    admin: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false // Define o valor padrão como falso
    }
}, {
    indexes: [
        {
            unique: false,
            fields: ['email']
        },
        {
            unique: false,
            fields: ['login']
        }
    ]
});

Consultores.sync({ alter: true }).then(() => {
    console.log("Tabela 'Consultores' criada ou atualizada no banco de dados");
}).catch(err => {
    console.error("Erro ao sincronizar modelo com o banco de dados:", err);
});

module.exports = Consultores;
