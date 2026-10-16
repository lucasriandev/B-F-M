const { z } = require('zod')
const prisma = require('../prisma')

const vendasPorMes = async (req, res) => {
    const relatorio = await prisma.venda.groupBy({
        by: ['mes'],
        _sum: {
            valor: true
        }
    })
    res.status(200).json({ vendasPorMes: relatorio })
}

module.exports = { vendasPorMes }