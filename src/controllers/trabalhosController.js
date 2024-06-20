const { trabalhoServices } = require('../services');

const salvarTrabalho = async (req, res) => {
    try {
        const novoTrabalho = await trabalhoServices.criarTrabalho(req.body);
        res.json({ success: true, trabalho: novoTrabalho });
    } catch (err) {
        console.error('Erro ao salvar trabalho:', err);
        res.status(500).json({ success: false, message: 'Erro ao salvar trabalho.' });
    }
};

const listarTrabalhos = async (req, res) => {
    try {
        const trabalhos = await trabalhoServices.buscarTrabalhos();
        res.render('trabalhos', { data: trabalhos });
    } catch (err) {
        console.error('Erro ao consultar dados do banco de dados:', err);
        res.status(500).send('Erro ao consultar dados do banco de dados.');
    }
};

const deletarTrabalho = async (req, res) => {
    try {
        const { id } = req.params;
        await trabalhoServices.deletarTrabalho(id);
        res.json({ success: true, message: 'Trabalho deletado com sucesso.' });
    } catch (err) {
        console.error('Erro ao deletar trabalho:', err);
        res.status(500).json({ success: false, message: 'Erro ao deletar trabalho.' });
    }
};

module.exports = { salvarTrabalho, listarTrabalhos, deletarTrabalho };
