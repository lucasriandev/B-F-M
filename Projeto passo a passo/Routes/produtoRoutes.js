const express = require("express");
// Router: mini-aplicação que agrupa as rotas de produtos
const router = express.Router();
// Importa as funções que fazem o trabalho de cada rota
const produtosControllers = require("../Controllers/produtoControllers");

// POST /produtos -> cria produto (o prefixo /produtos vem do app.js)
router.post("/", produtosControllers.post);
// GET /produtos -> lista produtos
router.get("/", produtosControllers.get);

// Exporta o router para o app.js registrar
module.exports = router;
