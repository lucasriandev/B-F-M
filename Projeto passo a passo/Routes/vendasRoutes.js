const express = require("express");
// Router: mini-aplicação que agrupa as rotas de vendas
const router = express.Router();
// Importa as funções que fazem o trabalho de cada rota
const VendasController = require("../Controllers/vendasControllers");

// POST /vendas -> cria venda (o prefixo /vendas vem do app.js)
router.post("/", VendasController.post);
// GET /vendas -> lista vendas
router.get("/", VendasController.get);

// Exporta o router para o app.js registrar
module.exports = router;
