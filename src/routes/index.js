const express = require('express');
const router = express.Router();
const clientesRoutes = require('./clientesRoutes');
const consultoresRoutes = require('./consultoresRoutes');
const consultoriaRoutes = require('./consultoriaRoutes');
const trabalhosRoutes = require('./trabalhosRoutes');
const loginRoutes = require('./loginRoutes');
const menuRoutes = require('./menuRoutes');

router.use('/cadastro/clientes', clientesRoutes);
router.use('/cadastro/consultores', consultoresRoutes);
router.use('/consultoria', consultoriaRoutes);
router.use('/consultas/trabalhos', trabalhosRoutes);
router.use('/login', loginRoutes);
router.use('/menu', menuRoutes);

module.exports = router;
