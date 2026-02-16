-- Create enums
CREATE TYPE "OszczednosciTransferTyp" AS ENUM ('DO_OSZCZEDNOSCI', 'DO_BUDZETU');
CREATE TYPE "OszczednosciCelStatus" AS ENUM ('AKTYWNY', 'ZAMKNIETY');
CREATE TYPE "OszczednosciCelRuchTyp" AS ENUM ('WPLATA', 'WYPLATA');

-- Create OszczednosciTransfer table
CREATE TABLE "OszczednosciTransfer" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "typ" "OszczednosciTransferTyp" NOT NULL,
  "kwota" DECIMAL(14,2) NOT NULL,
  "waluta" TEXT NOT NULL DEFAULT 'PLN',
  "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "notatka" TEXT,
  "utworzono" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "zaktualizowano" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "OszczednosciTransfer_pkey" PRIMARY KEY ("id")
);

-- Create OszczednosciCel table
CREATE TABLE "OszczednosciCel" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "nazwa" TEXT NOT NULL,
  "kwotaDocelowa" DECIMAL(14,2) NOT NULL,
  "kwotaZebrana" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "waluta" TEXT NOT NULL DEFAULT 'PLN',
  "status" "OszczednosciCelStatus" NOT NULL DEFAULT 'AKTYWNY',
  "utworzono" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "zaktualizowano" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "OszczednosciCel_pkey" PRIMARY KEY ("id")
);

-- Create OszczednosciCelRuch table
CREATE TABLE "OszczednosciCelRuch" (
  "id" TEXT NOT NULL,
  "celId" TEXT NOT NULL,
  "typ" "OszczednosciCelRuchTyp" NOT NULL,
  "kwota" DECIMAL(14,2) NOT NULL,
  "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "notatka" TEXT,
  "utworzono" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "OszczednosciCelRuch_pkey" PRIMARY KEY ("id")
);

-- Indexes
CREATE INDEX "OszczednosciTransfer_userId_idx" ON "OszczednosciTransfer"("userId");
CREATE INDEX "OszczednosciTransfer_waluta_idx" ON "OszczednosciTransfer"("waluta");
CREATE INDEX "OszczednosciCel_userId_idx" ON "OszczednosciCel"("userId");
CREATE INDEX "OszczednosciCel_waluta_idx" ON "OszczednosciCel"("waluta");
CREATE INDEX "OszczednosciCelRuch_celId_idx" ON "OszczednosciCelRuch"("celId");

-- Foreign keys
ALTER TABLE "OszczednosciTransfer" ADD CONSTRAINT "OszczednosciTransfer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Uzytkownik"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OszczednosciCel" ADD CONSTRAINT "OszczednosciCel_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Uzytkownik"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OszczednosciCelRuch" ADD CONSTRAINT "OszczednosciCelRuch_celId_fkey" FOREIGN KEY ("celId") REFERENCES "OszczednosciCel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
