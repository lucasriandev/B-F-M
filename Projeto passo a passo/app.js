const express = require("express");
const cors = require("cors");
const app = express();

//const rotas =

app.use(cors());
app.use(express.json());

//app.use(/rota, rota)

app.listen(3000, () => {
  console.log("Servidor ativo!");
});
