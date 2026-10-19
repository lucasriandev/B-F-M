// zod: valida o formato dos dados recebidos
const { z } = require("zod");
// prisma: conexão com o banco de dados
const prisma = require("../prisma");

// Molde do body do POST /vendedores: precisa de um nome com 3+ letras
const mensagemSchema = z.object({
  nome: z.string().min(3, "Vendedor precisa ter um nome maior!"),
});

// GET /vendedores -> lista todos os vendedores
const get = async (req, res) => {
  const vendedores = await prisma.vendedor.findMany(); // busca todos no banco
  res.status(200).json({ detalhe: vendedores.length, dados: vendedores });
};

// POST /vendedores -> cria um vendedor novo
const post = async (req, res) => {
  // Valida o body. Atenção: está fora do try, então se falhar o erro não é tratado aqui
  const mensagemValidade = mensagemSchema.parse(req.body);

  try {
    // Cria o vendedor no banco com o nome validado
    const novoVendedor = await prisma.vendedor.create({
      data: {
        nome: mensagemValidade.nome,
      },
    });
    // 201 = criado com sucesso
    res.status(201).json({ detalhe: "Sucesso no post", dados: novoVendedor });
  } catch (error) {
    // Se o banco falhar, responde com erro
    res.status(404).json({ Error: "Erro no post" });
  }
};

// Exporta as funções para as rotas usarem
module.exports = {
  get,
  post,
};
