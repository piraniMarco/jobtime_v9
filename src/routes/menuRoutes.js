const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('menu'); // Renderiza a página do menu diretamente
});

module.exports = router;
