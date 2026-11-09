import sqlite3
from pathlib import Path

import pandas as pd

# Caminho absoluto baseado na pasta do script (funciona de qualquer diretório)
caminhoSql = Path(__file__).parent / "prisma" / "dev.db"
conexao = sqlite3.connect(caminhoSql)

try:
    df = pd.read_sql_query("SELECT * FROM Venda", conexao)

    # Soma das vendas por vendedor e meta = total * 1.15
    agrupamento = df.groupby("vendedorId")["valor"].sum()
    metas = agrupamento * 1.15
    print(metas)

    cursor = conexao.cursor()
    for vendedorId, meta in metas.items():
        # UPSERT: vendedorId é UNIQUE, então rodar de novo atualiza em vez de dar erro
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