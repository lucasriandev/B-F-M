// express: framework que cria o servidor e as rotas
const express = require("express");
// cors: permite que um front-end em outro endereço acesse esta API
const cors = require("cors");
// Cria a aplicação (o servidor)
const app = express();

// Importa os grupos de rotas de cada assunto
const rotasVendedores = require("./Routes/vendedoresRoutes");
const rotasProdutos = require("./Routes/produtoRoutes");
const rotasVendas = require("./Routes/vendasRoutes");
const rotasRelatorios = require("./Routes/relatorioRoutes");
const pokemonCliente = require("./Routes/clienteExpressRoutes");

// Middlewares: rodam em toda requisição, antes das rotas
app.use(cors()); // libera acesso de outras origens
app.use(express.json()); // transforma o JSON do body em objeto (req.body)

// Registra cada grupo de rotas com seu prefixo de URL
app.use("/vendedores", rotasVendedores); // ex.: GET /vendedores
app.use("/produtos", rotasProdutos); // ex.: GET /produtos
app.use("/vendas", rotasVendas); // ex.: POST /vendas
app.use("/relatorio", rotasRelatorios); // ex.: GET /relatorio/vendas-por-mes
app.use("/pokemon", pokemonCliente);

// Liga o servidor na porta 3000
app.listen(3000, () => {
  console.log("Servidor ativo!");
});

//rotas dos pokemon indepentende
