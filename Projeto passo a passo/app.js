const express = require("express");
const cors = require("cors");
const app = express();

const rotasDasVendas = require("./Routes/vendasRoutes");

app.use(cors());
app.use(express.json());

app.use("/vendas", rotasDasVendas);

app.listen(3000, () => {
  console.log("Servidor ativo!");
});
