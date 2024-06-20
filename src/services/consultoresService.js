const Consultores = require('../models/consultores');

const criarConsultor = async (dados) => {
    return await Consultores.create(dados);
};

const buscarConsultores = async () => {
    return await Consultores.findAll();
};

const deletarConsultor = async (id) => {
    return await Consultores.destroy({ where: { id } });
};

const buscarConsultorPorLogin = async (login) => {
    return await Consultores.findOne({ where: { login } });
};

module.exports = { criarConsultor, buscarConsultores, deletarConsultor, buscarConsultorPorLogin };
