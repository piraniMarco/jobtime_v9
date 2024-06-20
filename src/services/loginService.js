// loginService.js

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const Consultores = require('../models/consultores');

// Rota para lidar com os dados do formulário de login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        res.render('login', { error: 'Por favor, preencha todos os campos.' });
    } else {
        try {
            const consultor = await Consultores.findOne({ where: { login: username } });
            if (consultor && await bcrypt.compare(password, consultor.senha)) {
                // Criação da sessão do consultor
                req.session.consultorId = consultor.id;
                // Redireciona para a página do menu
                res.redirect('/menu');
            } else {
                // Renderiza novamente a página de login com uma mensagem de erro
                res.render('login', { error: 'Credenciais inválidas.' });
            }
        } catch (err) {
            console.error('Erro ao verificar credenciais:', err);
            // Renderiza novamente a página de login com uma mensagem de erro
            res.render('login', { error: 'Erro ao processar o login.' });
        }
    }
});

module.exports = router;
