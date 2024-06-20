const Clientes = require('../models/clientes');

const criarCliente = async (dados) => {
    return await Clientes.create(dados);
};

const buscarClientes = async () => {
    return await Clientes.findAll();
};

const deletarCliente = async (id) => {
    return await Clientes.destroy({ where: { id } });
};

module.exports = { criarCliente, buscarClientes, deletarCliente };
