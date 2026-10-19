// zod: valida o formato dos dados recebidos
const { z } = require("zod");
// prisma: conexão com o banco de dados
const prisma = require("../prisma");

// Molde do body do POST /produtos
const mensagemSchema = z.object({
  nome: z.string().min(3, "Produto precisa ter no minino tres letras!"), // nome com 3+ letras
  quantidade: z.number().int().positive("Quantidade precisa ser positiva!"), // estoque: inteiro > 0
});

// GET /produtos -> lista todos os produtos
const get = async (req, res) => {
  const TodosProdutos = await prisma.produto.findMany(); // busca todos no banco
  res.status(200).json({ detalhe: TodosProdutos.length, dados: TodosProdutos });
};

// POST /produtos -> cria um produto novo com seu estoque inicial
const post = async (req, res) => {
  try {
    // Valida o body; se estiver errado, lança erro e cai no catch
    const mensagemValidada = mensagemSchema.parse(req.body);
    // Cria o produto no banco
    const novoProduto = await prisma.produto.create({
      data: {
        nome: mensagemValidada.nome,
        quantidade: mensagemValidada.quantidade,
      },
    });
    // 201 = criado com sucesso
    res
      .status(201)
      .json({ detalhe: "Post de produto feito!", dados: novoProduto });
  } catch (error) {
    // Qualquer erro (validação ou banco) cai aqui
    res.status(404).json({ Error: "Erro no post de produto!" });
  }
};

// Exporta as funções para as rotas usarem
module.exports = {
  get,
  post,
};
