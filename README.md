# FinSync – SaaS do budżetu osobistego

Wszystko po polsku, multi-user, RBAC, Stripe Billing, feature gating w backendzie.

## Wymagania
- Node.js 18+
- Docker Desktop (dla Postgres)

## Struktura
- `apps/api` – NestJS + Prisma + PostgreSQL
- `apps/web` – React + MUI
- `docs/ERD.md` – diagram ERD

## Produkcja – domeny (OVH)
- Kanoniczny URL aplikacji: `https://lifesync.pl/finsync/`
- Subdomena `https://finsync.lifesync.pl` przekierowuje (308) do `https://lifesync.pl/finsync/`
- API produkcyjne: `https://lifesync.pl/api/...`

Dlaczego tak:
- Jeden origin dla SPA i chunków JS zapobiega błędom dynamic import/CORS.

## Konfiguracja
Skopiuj pliki `.env.example`:

```bash
copy apps\\api\\.env.example apps\\api\\.env
```

Uzupełnij:
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_ID_PRO`, `STRIPE_PRICE_ID_FREE`
- `APP_URL`

## Uruchomienie backendu (dev)
1. Uruchom bazę:

```bash
docker compose up -d
```

2. Instalacja zależności:

```bash
cd apps\\api
npm install
```

3. Prisma:

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

4. Start API:

```bash
npm run start:dev
```

API: `http://localhost:4000`  
Swagger: `http://localhost:4000/api/docs`

## Testy
```bash
cd apps\\api
npm test
```

## Seed – konta testowe
Hasło do wszystkich: `Haslo123!`
- admin: `admin@finsync.local`
- user: `user@finsync.local`
- viewer: `viewer@finsync.local`

## Stripe – webhooki
Obsługiwane eventy:
- `invoice.paid`
- `invoice.payment_failed`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `checkout.session.completed`

Konfiguracja endpointu webhook:  
`POST http://localhost:4000/subscriptions/webhook`

## Następne kroki
Frontend `apps/web` (React + MUI)

## Uruchomienie frontendu (dev)
1. Skopiuj env:

```bash
copy apps\\web\\.env.example apps\\web\\.env
```

2. Instalacja zależności:

```bash
cd apps\\web
npm install
```

3. Start:

```bash
npm run dev
```

UI: `http://localhost:3000`

## Deploy OVH – checklista po wdrożeniu
1. `https://lifesync.pl/finsync/` -> `200`
2. `https://lifesync.pl/finsync/login` -> `200`
3. `https://finsync.lifesync.pl/` -> `308` na `https://lifesync.pl/finsync/`
4. `https://lifesync.pl/finsync/assets/...js` -> `200` bez redirectu na inną domenę
5. `https://lifesync.pl/api/health` -> `200`

## Prompt startowy (powrót do projektu)

Skopiuj i wklej w nowej rozmowie:

```
Wracamy do projektu Budget SaaS.
Ścieżka repo: C:\Users\User\projekty\budget-saas
Stack: NestJS + Prisma + PostgreSQL + React + MUI.
Backend port: 4000, frontend port: 3000.
Rejestracja użytkowników wyłączona (DISABLE_SELF_REGISTER=true).
Rolowanie budżetu jest per-budżet (switch „Roluj”), aktywne dla Oszczędności.
Pulpit ma dodatkowy kafel „Budżet” (narastający przychody–wydatki).
Ostatnio zmienialiśmy panel admina (usunięte globalne transakcje i raporty).
Proszę sprawdzić status i kontynuować.
```


