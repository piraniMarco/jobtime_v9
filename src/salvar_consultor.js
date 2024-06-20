const bcrypt = require('bcrypt');
const Sequelize = require('sequelize');
const sequelize = require('./config/database'); // Ajuste o caminho conforme necessário
const Consultores = require('./models/consultores'); // Ajuste o caminho conforme necessário

const salvarConsultor = async () => {
    try {
        await sequelize.sync(); // Sincroniza o modelo com o banco de dados

        const nome = 'Marco Antonio Pirani  ';
        const endereco = 'Rua Manoel Emerick, 186';
        const telefone = '48-99837-0626';
        const email = 'consultoria3@bremen.com.br';
        const login = 'pirani';
        const senha = 'momento@170839';
        const admin = true;

        // Criptografar a senha
        const senhaCriptografada = await bcrypt.hash(senha, 10);

        // Criar o novo consultor
        const novoConsultor = await Consultores.create({
            nome,
            endereco,
            telefone,
            email,
            login,
            senha: senhaCriptografada,
            admin
        });

        console.log('Consultor criado com sucesso:', novoConsultor.toJSON());
    } catch (err) {
        console.error('Erro ao criar consultor:', err);
    } finally {
        await sequelize.close(); // Fecha a conexão com o banco de dados
    }
};

// Executar a função para salvar o consultor
salvarConsultor();
