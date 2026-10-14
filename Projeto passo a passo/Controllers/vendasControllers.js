const { z } = require("zod");
const prisma = require("../prisma");

const vendaSchema = z.object({
  valor: z.number().positive(),
  mes: z.string().min(3),
  vendedorId: z.number().int().positive(),
});

const get = async (req, res) => {

  const todasVendas = await prisma.venda.findMany({
    include: { vendedor: true },
  });

  res.status(200).json({ detalhe: todasVendas.length, dados: todasVendas });
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

    const novaVenda = await prisma.venda.create({
      data: {
        valor: mensagemValidada.valor,
        mes: mensagemValidada.mes,
        vendedorId: mensagemValidada.vendedorId,
      },
    });

    res
      .status(201)
      .json({ detalhe: "Venda criada com sucesso", dados: novaVenda });
  } catch (error) {
    return res.status(400).json({ error: "Erro ao criar venda" });
  }
};

module.exports = { get, post };
