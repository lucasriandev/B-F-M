const express = require("express");
const router = express.Router();
const produtosControllers = require("../Controllers/produtoControllers");

router.post("/", produtosControllers.post);
router.get("/", produtosControllers.get);

module.exports = router;
