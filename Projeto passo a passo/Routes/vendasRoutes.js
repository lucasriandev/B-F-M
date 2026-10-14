const express = require("express");
const router = express.Router();
const VendasController = require("../Controllers/vendasControllers");

router.post("/", VendasController.post);
router.get("/", VendasController.get);

module.exports = router;
