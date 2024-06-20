const { consultoriaServices } = require('../services');

const salvarConsultoria = async (req, res) => {
    try {
        const novaConsultoria = await consultoriaServices.criarConsultoria(req.body);
        res.json({ success: true, consultoria: novaConsultoria });
    } catch (err) {
        console.error('Erro ao salvar consultoria:', err);
        res.status(500).json({ success: false, message: 'Erro ao salvar consultoria.' });
    }
};

const listarConsultorias = async (req, res) => {
    try {
        const consultorias = await consultoriaServices.buscarConsultorias();
        res.render('consultorias', { data: consultorias });
    } catch (err) {
        console.error('Erro ao consultar dados do banco de dados:', err);
        res.status(500).send('Erro ao consultar dados do banco de dados.');
    }
};

const deletarConsultoria = async (req, res) => {
    try {
        const { id } = req.params;
        await consultoriaServices.deletarConsultoria(id);
        res.json({ success: true, message: 'Consultoria deletada com sucesso.' });
    } catch (err) {
        console.error('Erro ao deletar consultoria:', err);
        res.status(500).json({ success: false, message: 'Erro ao deletar consultoria.' });
    }
};

module.exports = { salvarConsultoria, listarConsultorias, deletarConsultoria };
