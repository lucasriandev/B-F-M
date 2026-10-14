const { z } = require("zod");
const prisma = require("../Models/prisma.js");

const vendaSchema = z.object({
    valor: z.number().positive(),
    mes: z.string().min(3),
    vendedorId: z.number().int().positive(),
});

const get = async (req, res) => {

}

const post = async (req, res) => {

}

module.exports = { get, post, }