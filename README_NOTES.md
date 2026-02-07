# README_NOTES.md

## Start w przyszłości (krótka instrukcja)

Powrót do projektu Budget SaaS.

Repo:
- `C:\Users\User\projekty\budget-saas`

Stack:
- backend: NestJS + Prisma + PostgreSQL
- frontend: React + TypeScript + MUI

Porty:
- backend: `4000`
- frontend: `3000`

### Rejestracja
- wyłączona: `DISABLE_SELF_REGISTER=true` w `apps/api/.env`

### Budżety
- rolowanie per‑budżet (switch „Roluj”)
- aktywne hurtowo dla kategorii Oszczędności

### Pulpit
- kafel „Budżet” = narastające przychody–wydatki (niezależne od filtrów)

### Panel admina
- brak globalnych transakcji i raportów

### Uruchomienie
Backend:
```
cd C:\Users\User\projekty\budget-saas\apps\api
npm run start:dev
```

Frontend:
```
cd C:\Users\User\projekty\budget-saas\apps\web
npm run dev
```
