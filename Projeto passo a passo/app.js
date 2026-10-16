const express = require("express");
const cors = require("cors");
const app = express();

const rotasVendedores = require("./Routes/vendedoresRoutes");
const rotasProdutos = require("./Routes/produtoRoutes");
const rotasVendas = require("./Routes/vendasRoutes");
const rotasRelatorios = require("./Routes/relatorioRoutes");

app.use(cors());
app.use(express.json());

app.use("/vendedores", rotasVendedores);
app.use("/produtos", rotasProdutos);
app.use("/vendas", rotasVendas);
app.use("/relatorio", rotasRelatorios);

app.listen(3000, () => {
  console.log("Servidor ativo!");
});
