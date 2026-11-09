import sqlite3
import pandas as pd

caminhoSql = "./prisma/dev.db"
conexão = sqlite3.connect(caminhoSql)

print("Conexão feita!")

df = pd.read_sql_query("SELECT * FROM Venda", conexão)
print(df)
conexão.close()