const { clienteServices } = require('../services');

const salvarCliente = async (req, res) => {
    try {
        const novoCliente = await clienteServices.criarCliente(req.body);
        res.json({ success: true, cliente: novoCliente });
    } catch (err) {
        console.error('Erro ao salvar cliente:', err);
        res.status(500).json({ success: false, message: 'Erro ao salvar cliente.' });
    }
};

const listarClientes = async (req, res) => {
    try {
        const clientes = await clienteServices.buscarClientes();
        res.render('clientes', { data: clientes });
    } catch (err) {
        console.error('Erro ao consultar dados do banco de dados:', err);
        res.status(500).send('Erro ao consultar dados do banco de dados.');
    }
};

const deletarCliente = async (req, res) => {
    try {
        const { id } = req.params;
        await clienteServices.deletarCliente(id);
        res.json({ success: true, message: 'Cliente deletado com sucesso.' });
    } catch (err) {
        console.error('Erro ao deletar cliente:', err);
        res.status(500).json({ success: false, message: 'Erro ao deletar cliente.' });
    }
};

module.exports = { salvarCliente, listarClientes, deletarCliente };
