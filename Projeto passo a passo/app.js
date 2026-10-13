const express = require("express");
const cors = require("cors");
const app = express();

const rotasVendedores = require("./Routes/vendedoresRoutes");

app.use(cors());
app.use(express.json());

app.use("/vendedores", rotasVendedores);

app.listen(3000, () => {
  console.log("Servidor ativo!");
});
