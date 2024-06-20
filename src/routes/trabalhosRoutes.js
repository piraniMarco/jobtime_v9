const express = require('express');
const router = express.Router();
const { salvarTrabalho, listarTrabalhos, deletarTrabalho } = require('../controllers/trabalhosController');

router.post('/inserir', salvarTrabalho);
router.get('/', listarTrabalhos);
router.get('/emitirRelatorio', (req, res) => {
    res.render('emitirRelatorio'); // Renderiza a página de emitir relatórios
});
router.delete('/:id', deletarTrabalho);

module.exports = router;
