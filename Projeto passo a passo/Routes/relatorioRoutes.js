const express = require('express');
// Router: mini-aplicação que agrupa as rotas deste assunto
const router = express.Router()
// Importa as funções que fazem o trabalho de cada rota
const relatorioController = require('../Controllers/relatorioControllers')

// GET /relatorio/vendas-por-mes (o prefixo /relatorio vem do app.js)
router.get('/vendas-por-mes', relatorioController.vendasPorMes)

// Exporta o router para o app.js registrar
module.exports = router