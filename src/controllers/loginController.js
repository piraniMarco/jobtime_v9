const { consultoresServices } = require('../services');
const bcrypt = require('bcrypt');

const loginUser = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.render('login', { error: 'Por favor, preencha todos os campos.' });
    }

    try {
        const consultor = await consultoresServices.buscarConsultorPorLogin(username);
        if (consultor && await bcrypt.compare(password, consultor.senha)) {
            // Criação da sessão do consultor
            req.session.consultorId = consultor.id;
            // Redireciona para a página do menu
            return res.redirect('/menu');
        } else {
            // Renderiza novamente a página de login com uma mensagem de erro
            return res.render('login', { error: 'Credenciais inválidas.' });
        }
    } catch (err) {
        console.error('Erro ao verificar credenciais:', err);
        // Renderiza novamente a página de login com uma mensagem de erro
        return res.render('login', { error: 'Erro ao processar o login.' });
    }
};

module.exports = { loginUser };
