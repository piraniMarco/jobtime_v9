const express = require('express');
const router = express.Router();
const { salvarConsultor, listarConsultores, deletarConsultor } = require('../controllers/consultoresController');

router.post('/inserir', salvarConsultor);
router.get('/', listarConsultores);
router.get('/inserir', (req, res) => {
    res.render('inserirConsultor'); // Renderiza a página de inserir consultor
});
router.delete('/:id', deletarConsultor);

module.exports = router;
