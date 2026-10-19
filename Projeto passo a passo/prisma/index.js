// Carrega as variáveis do arquivo .env (ex.: DATABASE_URL)
require("dotenv").config();
// PrismaClient: a ferramenta que conversa com o banco de dados
const { PrismaClient } = require("@prisma/client");

// Cria UMA conexão com o banco, reaproveitada em todo o projeto
const prisma = new PrismaClient();

// Exporta para os controllers usarem com require("../prisma")
module.exports = prisma;
