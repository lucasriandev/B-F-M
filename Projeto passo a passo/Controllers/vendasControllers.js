
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
      }),
    )
    .min(1, "A venda precisa ter ao menos um item!"),
});

const get = async (req, res) => {

  const todasVendas = await prisma.venda.findMany({
    include: { vendedor: true, itens: { include: { produto: true } } },
  });

  const metas = await prisma.metaVendedor.findMany({
    include: {
      metaVendedor: true,
    },
  });

  const resultado = await prisma.venda.groupBy({
    by: ["mes"],
    _sum: {
      valor: true,
    },
  });

  res.status(200).json({
    detalhe: todasVendas.length,
    dados: todasVendas,
    vendaPorMes: resultado,
    metaVendedor: metas,
  });
};

class ErroNegocio extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const post = async (req, res) => {
  const parsed = vendaSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: "Dados invalidos", detalhes: parsed.error.issues });
  }

  const mensagemValidada = parsed.data;
  const produtoIds = mensagemValidada.itens.map((item) => item.produtoId);

  if (new Set(produtoIds).size !== produtoIds.length) {
    return res
      .status(400)
      .json({ error: "Produto repetido na venda! Some as quantidades." });
  }

  try {
    // Tudo (checagens + baixa de estoque + criacao) roda numa unica transacao.
    const novaVenda = await prisma.$transaction(async (tx) => {
      const vendedor = await tx.vendedor.findUnique({
        where: { id: mensagemValidada.vendedorId },
      });

      if (!vendedor) throw new ErroNegocio(404, "Vendedor nao existe!");

      for (const item of mensagemValidada.itens) {
        // Baixa atomica: o WHERE garante estoque suficiente no momento da escrita.
        const r = await tx.produto.updateMany({
          where: { id: item.produtoId, quantidade: { gte: item.quantidade } },
          data: { quantidade: { decrement: item.quantidade } },
        });

        if (r.count === 0) {
          const produto = await tx.produto.findUnique({ where: { id: item.produtoId } });

          if (!produto) throw new ErroNegocio(404, "Um ou mais produtos nao existe!");

          throw new ErroNegocio(
            400,
            `Estoque insuficiente para ${produto.nome}! Disponivel: ${produto.quantidade}`,
          );
        }
      }

      return tx.venda.create({
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
      });
    });

    return res
      .status(201)
      .json({ detalhe: "Venda criada com sucesso", dados: novaVenda });
  } catch (error) {
    if (error instanceof ErroNegocio) {
      return res.status(error.status).json({ error: error.message });
    }
    console.error(error);
    return res.status(500).json({ error: "Erro ao criar venda" });
  }
};
module.exports = { get, post };

