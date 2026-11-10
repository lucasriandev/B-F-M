// Teste de concorrencia: 2 vendas simultaneas do ultimo item. Espera 1x 201 e 1x 400.
const prisma = require("./prisma");
const { post } = require("./Controllers/vendasControllers");

const chamar = (body) => new Promise((resolve) => {
  const res = { status(c) { this.c = c; return this; }, json(j) { resolve({ status: this.c, j }); } };
  post({ body }, res);
});

(async () => {
  const v = await prisma.vendedor.create({ data: { nome: "Teste Race" } });
  const p = await prisma.produto.create({ data: { nome: "Produto Race", quantidade: 1 } });
  const body = { valor: 10, mes: "janeiro", vendedorId: v.id, itens: [{ produtoId: p.id, quantidade: 1 }] };
  const rs = await Promise.all(Array.from({ length: 5 }, () => chamar(body)));
  const final = await prisma.produto.findUnique({ where: { id: p.id } });
  console.log("status:", rs.map((r) => r.status), "estoque final:", final.quantidade);
  await prisma.itemVenda.deleteMany({ where: { produtoId: p.id } });
  await prisma.venda.deleteMany({ where: { vendedorId: v.id } });
  await prisma.produto.delete({ where: { id: p.id } });
  await prisma.vendedor.delete({ where: { id: v.id } });
  const ok = rs.filter((r) => r.status === 201).length === 1 && final.quantidade === 0;
  console.log(ok ? "PASSOU" : "FALHOU");
  process.exit(ok ? 0 : 1);
})();
