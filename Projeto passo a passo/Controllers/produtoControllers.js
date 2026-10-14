const { z } = require("zod");
const prisma = require("../prisma");

const mensagemSchema = z.object({
  nome: z.string().min(3, "Produto precisa ter no minino tres letras!"),
  quantidade: z.number().int().positive("Quantidade precisa ser positiva!"),
});

const get = async (req, res) => {
  const TodosProdutos = await prisma.produto.findMany();
  res.status(200).json({ detalhe: TodosProdutos.length, dados: TodosProdutos });
};

const post = async (req, res) => {
  try {
    const mensagemValidada = mensagemSchema.parse(req.body);
    const novoProduto = await prisma.produto.create({
      data: {
        nome: mensagemValidada.nome,
        quantidade: mensagemValidada.quantidade,
      },
    });
    res
      .status(201)
      .json({ detalhe: "Post de produto feito!", dados: novoProduto });
  } catch (error) {
    res.status(404).json({ Error: "Erro no post de produto!" });
  }
};

module.exports = {
  get,
  post,
};
