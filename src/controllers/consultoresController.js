const { consultorServices } = require('../services');

const salvarConsultor = async (req, res) => {
    try {
        const novoConsultor = await consultorServices.criarConsultor(req.body);
        res.json({ success: true, consultor: novoConsultor });
    } catch (err) {
        console.error('Erro ao salvar consultor:', err);
        res.status(500).json({ success: false, message: 'Erro ao salvar consultor.' });
    }
};

const listarConsultores = async (req, res) => {
    try {
        const consultores = await consultorServices.buscarConsultores();
        res.render('consultores', { data: consultores });
    } catch (err) {
        console.error('Erro ao consultar dados do banco de dados:', err);
        res.status(500).send('Erro ao consultar dados do banco de dados.');
    }
};

const deletarConsultor = async (req, res) => {
    try {
        const { id } = req.params;
        await consultorServices.deletarConsultor(id);
        res.json({ success: true, message: 'Consultor deletado com sucesso.' });
    } catch (err) {
        console.error('Erro ao deletar consultor:', err);
        res.status(500).json({ success: false, message: 'Erro ao deletar consultor.' });
    }
};

module.exports = { salvarConsultor, listarConsultores, deletarConsultor };
