// prisma: conexão com o banco de dados
const prisma = require('../prisma')

// GET /relatorio/vendas-por-mes -> total vendido em cada mês
const vendasPorMes = async (req, res) => {
    // Agrupa as vendas por mês e soma o valor de cada grupo
    // Resultado bruto: [{ mes: "Janeiro", _sum: { valor: 350 } }, ...]
    const relatorio = await prisma.venda.groupBy({
        by: ['mes'],
        _sum: {
            valor: true
        }
    })

    // Reformata cada item para um formato mais simples: { mes, total }
    const relatorioFinal = relatorio.map(item => {
        return {
            mes: item.mes,
            total: item._sum.valor
        }
    })

    // Devolve a lista já formatada
    res.json(relatorioFinal)
}

// Exporta a função para a rota usar
module.exports = { vendasPorMes }