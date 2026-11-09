import sqlite3
import pandas as pd

caminhoSql = "./prisma/dev.db"
conexão = sqlite3.connect(caminhoSql)

print("Conexão feita!")

df = pd.read_sql_query("SELECT * FROM Venda", conexão)
print(df)

agrupamento = df.groupby("vendedorId")["valor"].sum()
print(agrupamento)

metas = agrupamento * 1.15
print(metas)

cursor = conexão.cursor()

for vendedorId, meta in metas.items():
    print(vendedorId, meta)

    cursor.execute(
        "INSERT INTO MetaVendedor (meta, vendedorId) VALUES (?, ?)",
        (float(meta), int(vendedorId))
    )

conexão.commit()

resultado = pd.read_sql_query("SELECT * FROM MetaVendedor", conexão)
print(resultado)

conexão.close()