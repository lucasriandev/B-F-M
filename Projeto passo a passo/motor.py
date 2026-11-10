import sqlite3
from pathlib import Path

import pandas as pd

caminhoSql = Path(__file__).parent / "prisma" / "dev.db"
conexao = sqlite3.connect(caminhoSql)

try:
    df = pd.read_sql_query("SELECT * FROM Venda", conexao)

    agrupamento = df.groupby("vendedorId")["valor"].sum()
    metas = agrupamento * 1.15
    print(metas)

    cursor = conexao.cursor()
    for vendedorId, meta in metas.items():

        cursor.execute(
            """
            INSERT INTO MetaVendedor (meta, vendedorId) VALUES (?, ?)
            ON CONFLICT(vendedorId) DO UPDATE SET meta = excluded.meta
            """,
            (float(meta), int(vendedorId)),
        )
    conexao.commit()

    print(pd.read_sql_query("SELECT * FROM MetaVendedor", conexao))
finally:
    conexao.close()