const Trabalhos = require('../models/trabalhos');

const criarTrabalho = async (dados) => {
    return await Trabalhos.create(dados);
};

const buscarTrabalhos = async () => {
    return await Trabalhos.findAll();
};

const deletarTrabalho = async (id) => {
    return await Trabalhos.destroy({ where: { id } });
};

module.exports = { criarTrabalho, buscarTrabalhos, deletarTrabalho };
