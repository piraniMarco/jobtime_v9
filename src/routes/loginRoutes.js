const express = require('express');
const router = express.Router();
const { loginUser } = require('../controllers/loginController');

router.post('/', loginUser);
router.get('/', (req, res) => {
    res.render('login');
});

module.exports = router;
