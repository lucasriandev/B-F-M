const get = async (req, res) => {
  const urlPokemon = "https://pokeapi.co/api/v2/pokemon";

  try {
    const resposta = await fetch(urlPokemon);
    const dados = await resposta.json();

    const filtro = await Promise.all(
      dados.results.map(async (p) => {
        const detalhes = await (await fetch(p.url)).json();
        return {
          nome: p.name,
          peso: detalhes.weight
        }
      })
    )


    res.status(200).json({ dados: filtro });
  } catch (error) {
    res.status(404).json({ error: "pokemon nao encontrado!" });
  }
};

module.exports = {
  get,
};
