const get = async (req, res) => {
  const urlPokemon = "https://pokeapi.co/api/v2/pokemon";

  try {
    const resposta = await fetch(urlPokemon);
    const dados = await resposta.json();
    res.status(200).json({ Detalhe: dados.length, dados: dados });
  } catch (error) {
    res.status(404).json({ error: "pokemon nao encontrado!" });
  }
};

module.exports = {
  get,
};
