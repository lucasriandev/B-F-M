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

// NOVO (Exercício 3): node-cron agenda tarefas que rodam sozinhas em horários definidos
// (instalado com: npm install node-cron)
const cron = require("node-cron");
// NOVO: reaproveita a conexão do Prisma para consultar o banco dentro da tarefa
const prisma = require("./prisma");

// Middlewares: rodam em toda requisição, antes das rotas
app.use(cors()); // libera acesso de outras origens
app.use(express.json()); // transforma o JSON do body em objeto (req.body)

// Registra cada grupo de rotas com seu prefixo de URL
app.use("/vendedores", rotasVendedores); // ex.: GET /vendedores
app.use("/produtos", rotasProdutos); // ex.: GET /produtos
app.use("/vendas", rotasVendas); // ex.: POST /vendas
app.use("/relatorio", rotasRelatorios); // ex.: GET /relatorio/vendas-por-mes
app.use("/pokemon", pokemonCliente);

// NOVO (Exercício 3): tarefa agendada (job) de alerta de estoque baixo.
// cron.schedule(expressão, função): a expressão tem 5 campos:
//   minuto hora dia-do-mês mês dia-da-semana
// "* * * * *" = todo campo com "qualquer valor" => executa a CADA MINUTO
// (bom para testar localmente; em produção usaríamos algo como "0 8 * * *", todo dia às 8h)
cron.schedule("* * * * *", async () => {
  // async: porque dentro usamos await para esperar a resposta do banco

  // try/catch: se a consulta falhar (ex.: banco fora do ar), o erro é capturado
  // aqui e registrado, em vez de derrubar o processo. Na próxima execução
  // (1 minuto depois) a tarefa tenta de novo automaticamente.
  try {
    // findMany busca VÁRIOS registros; where filtra no próprio banco.
    // { lt: 5 } = "less than" (menor que 5), ou seja, estritamente abaixo de 5.
    const produtosBaixos = await prisma.produto.findMany({
      where: { quantidade: { lt: 5 } },
    });

    // Só avisa se o array tiver itens (length > 0)
    if (produtosBaixos.length > 0) {
      // Percorre cada produto em risco e imprime o aviso no terminal
      produtosBaixos.forEach((produto) => {
        console.log(`Aviso: O produto ${produto.nome} está quase a esgotar!`);
      });
    }
  } catch (erro) {
    // Registra a falha; a tarefa continua agendada para o próximo minuto
    console.error("Erro ao verificar o estoque:", erro.message);
  }
});

// Liga o servidor na porta 3000
app.listen(3000, () => {
  console.log("Servidor ativo!");
});

//rotas dos pokemon indepentende
