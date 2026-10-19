// zod: biblioteca que valida se os dados recebidos no body têm o formato certo
const { z } = require("zod");
// prisma: conexão com o banco de dados (arquivo prisma/index.js)
const prisma = require("../prisma");

// Define o "molde" que o body do POST /vendas precisa seguir
const vendaSchema = z.object({
  valor: z.number().positive(), // número maior que zero
  mes: z.string().min(3), // texto com no mínimo 3 letras
  vendedorId: z.number().int().positive(), // id do vendedor (inteiro positivo)
  // itens: array (lista) de produtos vendidos nesta venda
  itens: z
    .array(
      // cada item da lista precisa ter este formato:
      z.object({
        produtoId: z.number().int().positive(), // qual produto foi vendido
        quantidade: z.number().int().positive(), // quantas unidades
      })
    )
    .min(1, "A venda precisa ter ao menos um item!"), // não aceita lista vazia
});

// GET /vendas -> lista todas as vendas
const get = async (req, res) => {
  // findMany busca todas as vendas.
  // include traz junto os dados relacionados:
  //   vendedor -> o vendedor que fez a venda
  //   itens -> os itens da venda, e dentro de cada item o produto
  const todasVendas = await prisma.venda.findMany({
    include: { vendedor: true, itens: { include: { produto: true } } },
  });

  // groupBy agrupa as vendas por mês e soma o campo valor de cada grupo
  // (usado para alimentar o gráfico de vendas por mês)
  const resultado = await prisma.venda.groupBy({
    by: ["mes"],
    _sum: {
      valor: true,
    },
  });

  // Responde 200 (OK) com a quantidade, a lista e o total por mês
  res
    .status(200)
    .json({
      detalhe: todasVendas.length,
      dados: todasVendas,
      vendaPorMes: resultado,
    });
};

// POST /vendas -> cria uma venda nova e abate o estoque dos produtos
const post = async (req, res) => {
  try {
    // 1) Valida o body com o molde acima. Se estiver errado, lança erro e cai no catch
    const mensagemValidada = vendaSchema.parse(req.body);

    // 2) Confere se o vendedor informado existe no banco
    const vendedorExiste = await prisma.vendedor.findUnique({
      where: { id: mensagemValidada.vendedorId },
    });

    // Se não existe, responde 404 e para a função (return)
    if (!vendedorExiste) {
      return res.status(404).json({ error: "Vendedor nao existe!" });
    }

    // 3) Monta uma lista só com os ids dos produtos. Ex.: [1, 3]
    const produtoIds = mensagemValidada.itens.map((item) => item.produtoId);

    // Set remove repetidos. Se o tamanho mudou, o mesmo produto veio 2 vezes
    if (new Set(produtoIds).size !== produtoIds.length) {
      return res
        .status(400)
        .json({ error: "Produto repetido na venda! Some as quantidades." });
    }

    // 4) Busca no banco todos os produtos cujo id está na lista (in)
    const produtosExistem = await prisma.produto.findMany({
      where: {
        id: {
          in: produtoIds,
        },
      },
    });

    // Se encontrou menos produtos do que foram pedidos, algum id não existe
    if (produtosExistem.length !== mensagemValidada.itens.length) {
      return res.status(404).json({ error: "Um ou mais produtos nao existe!" });
    }

    // 5) Confere o estoque de cada item
    for (const item of mensagemValidada.itens) {
      // acha o produto do banco que corresponde a este item
      const produto = produtosExistem.find((p) => p.id === item.produtoId);
      // se pediu mais do que tem em estoque, recusa a venda
      if (produto.quantidade < item.quantidade) {
        return res.status(400).json({
          error: `Estoque insuficiente para ${produto.nome}! Disponivel: ${produto.quantidade}`,
        });
      }
    }

    // 6) $transaction executa várias operações juntas: ou todas dão certo,
    // ou nenhuma é salva. O resultado volta numa lista na mesma ordem;
    // [novaVenda] pega só o primeiro resultado (a venda criada)
    const [novaVenda] = await prisma.$transaction([
      // Operação 1: cria a venda
      prisma.venda.create({
        data: {
          valor: mensagemValidada.valor,
          mes: mensagemValidada.mes,
          vendedorId: mensagemValidada.vendedorId,
          // itens.create cria os ItemVenda já ligados a esta venda
          // (o vendaId é preenchido sozinho pelo Prisma)
          itens: {
            create: mensagemValidada.itens.map((item) => ({
              produtoId: item.produtoId,
              quantidade: item.quantidade,
            })),
          },
        },
        include: { itens: true }, // devolve a venda já com os itens
      }),
      // Operações seguintes: uma atualização de estoque por item.
      // O "..." espalha a lista de operações dentro do array da transação
      ...mensagemValidada.itens.map((item) =>
        prisma.produto.update({
          where: { id: item.produtoId },
          // decrement subtrai direto no banco: estoque = estoque - quantidade
          data: { quantidade: { decrement: item.quantidade } },
        })
      ),
    ]);

    // 7) Tudo certo: responde 201 (Created) com a venda criada
    res
      .status(201)
      .json({ detalhe: "Venda criada com sucesso", dados: novaVenda });
  } catch (error) {
    // Qualquer erro (validação do zod, banco, etc.) cai aqui
    return res.status(400).json({ error: "Erro ao criar venda" });
  }
};

// Exporta as funções para as rotas (Routes/vendasRoutes.js) usarem
module.exports = { get, post };
