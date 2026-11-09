import sqlite3
import pandas as pd

caminhoSql = "./prisma/dev.db"
conexão = sqlite3.connect(caminhoSql)

print("Conexão feita!")

df = pd.read_sql_query("SELECT * FROM Venda", conexão)
print(df)

df["novaMeta"] = df["valor"] * 1.15
print(df)

agrupamento = df.groupby("vendedorId")["valor"].sum()
print(agrupamento)

conexão.close()