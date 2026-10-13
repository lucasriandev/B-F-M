const express = require("express");
const router = express.Router();
const vendedoresControllers = require("../Controllers/vendedoresControllers");

router.post("/", vendedoresControllers.post);
router.get("/", vendedoresControllers.get);

module.exports = router;
