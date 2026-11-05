-- CreateTable
CREATE TABLE "MetaVendedor" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "meta" REAL NOT NULL,
    "vendedorId" INTEGER NOT NULL,
    CONSTRAINT "MetaVendedor_vendedorId_fkey" FOREIGN KEY ("vendedorId") REFERENCES "Vendedor" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
