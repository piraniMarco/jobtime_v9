// Importando os módulos necessários
const express = require('express');
const router = express.Router();
const path = require('path'); // Módulo para lidar com caminhos de arquivos, caso necessário

// Middleware de verificação de autenticação (opcional, caso você tenha autenticação)
function checkAuth(req, res, next) {
    if (req.session && req.session.consultorId) {
        next();
    } else {
        res.redirect('/login');
    }
}

// Rota para a página do menu principal
router.get('/menu', checkAuth, (req, res) => {
    // Renderiza o arquivo menu.ejs
    res.render('menu');
});

// Exporta o router para ser usado em outras partes do aplicativo
module.exports = router;
