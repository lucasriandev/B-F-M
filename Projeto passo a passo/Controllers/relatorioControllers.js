const prisma = require('../prisma')

const vendasPorMes = async (req, res) => {
    const relatorio = await prisma.venda.groupBy({
        by: ['mes'],
        _sum: {
            valor: true
        }
    })

    const relatorioFinal = relatorio.map(item => {
        return {
            mes: item.mes,
            total: item._sum.valor
        }
    })

    res.json(relatorioFinal)
}

module.exports = { vendasPorMes }