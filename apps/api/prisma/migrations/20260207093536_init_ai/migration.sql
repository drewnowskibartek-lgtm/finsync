-- CreateEnum
CREATE TYPE "Rola" AS ENUM ('ADMIN', 'USER', 'VIEWER');

-- CreateEnum
CREATE TYPE "Plan" AS ENUM ('FREE', 'PRO');

-- CreateEnum
CREATE TYPE "StatusSubskrypcji" AS ENUM ('AKTYWNA', 'WSTRZYMANA', 'ANULOWANA', 'BRAK');

-- CreateEnum
CREATE TYPE "Czestotliwosc" AS ENUM ('DZIENNA', 'TYGODNIOWA', 'MIESIECZNA', 'ROCZNA');

-- CreateTable
CREATE TABLE "Uzytkownik" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "hasloHash" TEXT NOT NULL,
    "rola" "Rola" NOT NULL DEFAULT 'USER',
    "zablokowany" BOOLEAN NOT NULL DEFAULT false,
    "utworzono" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "zaktualizowano" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Uzytkownik_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transakcja" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "kwota" DECIMAL(14,2) NOT NULL,
    "waluta" TEXT NOT NULL DEFAULT 'PLN',
    "odbiorca" TEXT NOT NULL,
    "referencja" TEXT,
    "kategoriaId" TEXT,
    "metoda" TEXT,
    "notatka" TEXT,
    "utworzonoPrzez" TEXT NOT NULL,
    "czyUzgodnione" BOOLEAN NOT NULL DEFAULT false,
    "flagaDuplikatu" BOOLEAN NOT NULL DEFAULT false,
    "utworzono" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "zaktualizowano" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transakcja_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Kategoria" (
    "id" TEXT NOT NULL,
    "nazwa" TEXT NOT NULL,
    "globalna" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT,
    "utworzono" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Kategoria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Budzet" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kategoriaId" TEXT NOT NULL,
    "rok" INTEGER NOT NULL,
    "miesiac" INTEGER NOT NULL,
    "kwota" DECIMAL(14,2) NOT NULL,
    "utworzono" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Budzet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recurring" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kwota" DECIMAL(14,2) NOT NULL,
    "kategoriaId" TEXT,
    "odbiorca" TEXT NOT NULL,
    "metoda" TEXT,
    "notatka" TEXT,
    "czestotliwosc" "Czestotliwosc" NOT NULL,
    "nastepnaData" TIMESTAMP(3) NOT NULL,
    "aktywna" BOOLEAN NOT NULL DEFAULT true,
    "utworzono" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Recurring_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "transakcjaId" TEXT,
    "akcja" TEXT NOT NULL,
    "notatka" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subskrypcja" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "plan" "Plan" NOT NULL DEFAULT 'FREE',
    "status" "StatusSubskrypcji" NOT NULL DEFAULT 'BRAK',
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "currentPeriodEnd" TIMESTAMP(3),
    "utworzono" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "zaktualizowano" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subskrypcja_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanKonfiguracja" (
    "id" TEXT NOT NULL,
    "plan" "Plan" NOT NULL,
    "stripePriceId" TEXT NOT NULL,
    "aktywny" BOOLEAN NOT NULL DEFAULT true,
    "utworzono" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlanKonfiguracja_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LogSystemowy" (
    "id" TEXT NOT NULL,
    "poziom" TEXT NOT NULL,
    "wiadomosc" TEXT NOT NULL,
    "utworzono" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LogSystemowy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiUzycie" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "licznik" INTEGER NOT NULL DEFAULT 0,
    "utworzono" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiUzycie_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Uzytkownik_email_key" ON "Uzytkownik"("email");

-- CreateIndex
CREATE INDEX "Transakcja_userId_idx" ON "Transakcja"("userId");

-- CreateIndex
CREATE INDEX "Transakcja_data_idx" ON "Transakcja"("data");

-- CreateIndex
CREATE INDEX "Kategoria_userId_idx" ON "Kategoria"("userId");

-- CreateIndex
CREATE INDEX "Budzet_userId_idx" ON "Budzet"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Budzet_userId_kategoriaId_rok_miesiac_key" ON "Budzet"("userId", "kategoriaId", "rok", "miesiac");

-- CreateIndex
CREATE INDEX "Recurring_userId_idx" ON "Recurring"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Subskrypcja_userId_key" ON "Subskrypcja"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PlanKonfiguracja_plan_key" ON "PlanKonfiguracja"("plan");

-- CreateIndex
CREATE INDEX "AiUzycie_userId_idx" ON "AiUzycie"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "AiUzycie_userId_data_key" ON "AiUzycie"("userId", "data");

-- AddForeignKey
ALTER TABLE "Transakcja" ADD CONSTRAINT "Transakcja_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Uzytkownik"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transakcja" ADD CONSTRAINT "Transakcja_kategoriaId_fkey" FOREIGN KEY ("kategoriaId") REFERENCES "Kategoria"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Kategoria" ADD CONSTRAINT "Kategoria_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Uzytkownik"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Budzet" ADD CONSTRAINT "Budzet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Uzytkownik"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Budzet" ADD CONSTRAINT "Budzet_kategoriaId_fkey" FOREIGN KEY ("kategoriaId") REFERENCES "Kategoria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recurring" ADD CONSTRAINT "Recurring_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Uzytkownik"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recurring" ADD CONSTRAINT "Recurring_kategoriaId_fkey" FOREIGN KEY ("kategoriaId") REFERENCES "Kategoria"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Uzytkownik"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subskrypcja" ADD CONSTRAINT "Subskrypcja_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Uzytkownik"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiUzycie" ADD CONSTRAINT "AiUzycie_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Uzytkownik"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
