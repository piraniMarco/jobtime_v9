const Consultorias = require('../models/consultoria');

const criarConsultoria = async (dados) => {
    return await Consultorias.create(dados);
};

const buscarConsultorias = async () => {
    return await Consultorias.findAll();
};

const deletarConsultoria = async (id) => {
    return await Consultorias.destroy({ where: { id } });
};

module.exports = { criarConsultoria, buscarConsultorias, deletarConsultoria };
