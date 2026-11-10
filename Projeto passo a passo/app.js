
const express = require("express");

const cors = require("cors");

const app = express();

const rotasVendedores = require("./Routes/vendedoresRoutes");
const rotasProdutos = require("./Routes/produtoRoutes");
const rotasVendas = require("./Routes/vendasRoutes");
const rotasRelatorios = require("./Routes/relatorioRoutes");
const pokemonCliente = require("./Routes/clienteExpressRoutes");

const cron = require("node-cron");

const prisma = require("./prisma");

app.use(cors());
app.use(express.json());

app.use("/vendedores", rotasVendedores);
app.use("/produtos", rotasProdutos);
app.use("/vendas", rotasVendas);
app.use("/relatorio", rotasRelatorios);
app.use("/pokemon", pokemonCliente);

cron.schedule("* * * * *", async () => {

  try {

    const produtosBaixos = await prisma.produto.findMany({
      where: { quantidade: { lt: 5 } },
    });

    if (produtosBaixos.length > 0) {

      produtosBaixos.forEach((produto) => {
        console.log(`Aviso: O produto ${produto.nome} está quase a esgotar!`);
      });
    }
  } catch (erro) {

    console.error("Erro ao verificar o estoque:", erro.message);
  }
});

app.listen(3000, () => {
  console.log("Servidor ativo!");
});

