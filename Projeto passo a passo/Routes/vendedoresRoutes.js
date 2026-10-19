const express = require("express");
// Router: mini-aplicação que agrupa as rotas de vendedores
const router = express.Router();
// Importa as funções que fazem o trabalho de cada rota
const vendedoresControllers = require("../Controllers/vendedoresControllers");

// POST /vendedores -> cria vendedor (o prefixo /vendedores vem do app.js)
router.post("/", vendedoresControllers.post);
// GET /vendedores -> lista vendedores
router.get("/", vendedoresControllers.get);

// Exporta o router para o app.js registrar
module.exports = router;
