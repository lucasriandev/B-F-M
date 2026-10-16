const express = require('express');
const router = express.Router()
const relatorioController = require('../Controllers/relatorioControllers')

router.get('/vendas-por-mes', relatorioController.vendasPorMes)

module.exports = router