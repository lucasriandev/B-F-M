const express = require("express");
const router = express.Router();

const pokemonControllers = require("../Controllers/clienteExpressControllers");

router.get("/", pokemonControllers.get);

module.exports = router;
