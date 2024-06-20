const express = require('express');
const router = express.Router();
const { salvarCliente, listarClientes, deletarCliente } = require('../controllers/clientesController');

router.post('/inserir', salvarCliente);
router.get('/', listarClientes);
router.get('/inserir', (req, res) => {
    res.render('inserirCliente'); // Renderiza a página de inserir cliente
});
router.delete('/:id', deletarCliente);

module.exports = router;
