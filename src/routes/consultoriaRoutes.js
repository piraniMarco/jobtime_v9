const express = require('express');
const router = express.Router();
const { salvarConsultoria, listarConsultorias, deletarConsultoria } = require('../controllers/consultoriaController');

router.post('/inserir', salvarConsultoria);
router.get('/', listarConsultorias);
router.get('/inserir', (req, res) => {
    res.render('inserirConsultoria'); // Renderiza a página de inserir consultoria
});
router.delete('/:id', deletarConsultoria);

module.exports = router;
