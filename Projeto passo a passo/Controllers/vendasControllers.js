const { z } = require("zod");
const prisma = require("../prisma");

const vendaSchema = z.object({
  valor: z.number().positive(),
  mes: z.string().min(3),
  vendedorId: z.number().int().positive(),
  itens: z
    .array(
      z.object({
        produtoId: z.number().int().positive(),
        quantidade: z.number().int().positive(),
      })
    )
    .min(1, "A venda precisa ter ao menos um item!"),
});

const get = async (req, res) => {
  const todasVendas = await prisma.venda.findMany({
    include: { vendedor: true, itens: { include: { produto: true } } },
  });

  const resultado = await prisma.venda.groupBy({
    by: ["mes"],
    _sum: {
      valor: true,
    },
  });

  res
    .status(200)
    .json({
      detalhe: todasVendas.length,
      dados: todasVendas,
      vendaPorMes: resultado,
    });
};

const post = async (req, res) => {
  try {
    const mensagemValidada = vendaSchema.parse(req.body);

    const vendedorExiste = await prisma.vendedor.findUnique({
      where: { id: mensagemValidada.vendedorId },
    });

    if (!vendedorExiste) {
      return res.status(404).json({ error: "Vendedor nao existe!" });
    }

    const produtoIds = mensagemValidada.itens.map((item) => item.produtoId);

    if (new Set(produtoIds).size !== produtoIds.length) {
      return res
        .status(400)
        .json({ error: "Produto repetido na venda! Some as quantidades." });
    }

    const produtosExistem = await prisma.produto.findMany({
      where: {
        id: {
          in: produtoIds,
        },
      },
    });

    if (produtosExistem.length !== mensagemValidada.itens.length) {
      return res.status(404).json({ error: "Um ou mais produtos nao existe!" });
    }

    for (const item of mensagemValidada.itens) {
      const produto = produtosExistem.find((p) => p.id === item.produtoId);
      if (produto.quantidade < item.quantidade) {
        return res.status(400).json({
          error: `Estoque insuficiente para ${produto.nome}! Disponivel: ${produto.quantidade}`,
        });
      }
    }

    const [novaVenda] = await prisma.$transaction([
      prisma.venda.create({
        data: {
          valor: mensagemValidada.valor,
          mes: mensagemValidada.mes,
          vendedorId: mensagemValidada.vendedorId,
          itens: {
            create: mensagemValidada.itens.map((item) => ({
              produtoId: item.produtoId,
              quantidade: item.quantidade,
            })),
          },
        },
        include: { itens: true },
      }),
      ...mensagemValidada.itens.map((item) =>
        prisma.produto.update({
          where: { id: item.produtoId },
          data: { quantidade: { decrement: item.quantidade } },
        })
      ),
    ]);

    res
      .status(201)
      .json({ detalhe: "Venda criada com sucesso", dados: novaVenda });
  } catch (error) {
    return res.status(400).json({ error: "Erro ao criar venda" });
  }
};

module.exports = { get, post };
