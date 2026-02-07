# AGENTS.md

Powrót do projektu Budget SaaS.

Repo:
- ścieżka: `C:\Users\User\projekty\budget-saas`

Stack:
- backend: NestJS + Prisma + PostgreSQL
- frontend: React + TypeScript + MUI

Porty dev:
- backend: `4000`
- frontend: `3000`

Konfiguracja:
- rejestracja wyłączona: `DISABLE_SELF_REGISTER=true` w `apps/api/.env`

Budżety:
- rolowanie per-budżet (przełącznik „Roluj”)
- aktywne dla Oszczędności (hurtowo ustawione w DB)

Pulpit:
- dodatkowy kafel „Budżet” (narastające przychody–wydatki, niezależne od filtrów)

Panel admina:
- usunięte globalne transakcje i raporty

Ostatnie zmiany:
- responsywne logo w login i AppShell
- filtry miesiąc/zakres na pulpicie i w raportach
