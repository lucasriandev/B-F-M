
const { z } = require("zod");

const prisma = require("../prisma");

const mensagemSchema = z.object({
  nome: z.string().min(3, "Vendedor precisa ter um nome maior!"),
});

const get = async (req, res) => {
  const vendedores = await prisma.vendedor.findMany();
  res.status(200).json({ detalhe: vendedores.length, dados: vendedores });
};

const getMetas = async (req, res) => {
  try {
    const vendedores = await prisma.vendedor.findMany({ include: { meta: true } });
    res.status(200).json({ detalhe: vendedores.length, dados: vendedores });
  } catch (error) {
    res.status(500).json({ Error: "Erro ao buscar metas" });
  }
};

const post = async (req, res) => {

  const mensagemValidade = mensagemSchema.parse(req.body);

  try {

    const novoVendedor = await prisma.vendedor.create({
      data: {
        nome: mensagemValidade.nome,
      },
    });

    res.status(201).json({ detalhe: "Sucesso no post", dados: novoVendedor });
  } catch (error) {

    res.status(404).json({ Error: "Erro no post" });
  }
};

module.exports = {
  get,
  getMetas,
  post,
};
