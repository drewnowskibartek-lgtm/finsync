"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = require("bcrypt");
const prisma = new client_1.PrismaClient();
async function main() {
    const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS ?? 12);
    const hasloHash = await bcrypt.hash('Haslo123!', saltRounds);
    const admin = await prisma.uzytkownik.upsert({
        where: { email: 'admin@finsync.local' },
        update: {},
        create: {
            email: 'admin@finsync.local',
            hasloHash,
            rola: 'ADMIN',
            subskrypcja: { create: { plan: 'PRO', status: 'AKTYWNA' } },
        },
    });
    const user = await prisma.uzytkownik.upsert({
        where: { email: 'user@finsync.local' },
        update: {},
        create: {
            email: 'user@finsync.local',
            hasloHash,
            rola: 'USER',
            subskrypcja: { create: { plan: 'PRO', status: 'AKTYWNA' } },
        },
    });
    const viewer = await prisma.uzytkownik.upsert({
        where: { email: 'viewer@finsync.local' },
        update: {},
        create: {
            email: 'viewer@finsync.local',
            hasloHash,
            rola: 'VIEWER',
            subskrypcja: { create: { plan: 'FREE', status: 'BRAK' } },
        },
    });
    const globalCategories = [
        'Żywność',
        'Mieszkanie',
        'Transport',
        'Zdrowie',
        'Rozrywka',
        'Wynagrodzenie',
        'Oszczędności',
    ];
    for (const name of globalCategories) {
        await prisma.kategoria.upsert({
            where: { id: `${name}-global` },
            update: {},
            create: { id: `${name}-global`, nazwa: name, globalna: true },
        });
    }
    const salaryCategory = await prisma.kategoria.findUnique({
        where: { id: 'Wynagrodzenie-global' },
    });
    const userCategory = await prisma.kategoria.upsert({
        where: { id: 'user-edu' },
        update: {},
        create: {
            id: 'user-edu',
            nazwa: 'Edukacja',
            globalna: false,
            userId: user.id,
        },
    });
    await prisma.budzet.create({
        data: {
            userId: user.id,
            kategoriaId: userCategory.id,
            rok: new Date().getFullYear(),
            miesiac: new Date().getMonth() + 1,
            kwota: new client_1.Prisma.Decimal(1200),
        },
    });
    await prisma.recurring.create({
        data: {
            userId: user.id,
            kwota: new client_1.Prisma.Decimal(250),
            kategoriaId: userCategory.id,
            odbiorca: 'Subskrypcja kursu',
            metoda: 'karta',
            notatka: 'Miesięczna subskrypcja',
            czestotliwosc: 'MIESIECZNA',
            nastepnaData: new Date(),
        },
    });
    await prisma.transakcja.createMany({
        data: [
            {
                userId: user.id,
                data: new Date(),
                kwota: new client_1.Prisma.Decimal(-120.5),
                waluta: 'PLN',
                odbiorca: 'Sklep spożywczy',
                kategoriaId: userCategory.id,
                utworzonoPrzez: user.id,
                czyUzgodnione: true,
            },
            {
                userId: user.id,
                data: new Date(),
                kwota: new client_1.Prisma.Decimal(3500),
                waluta: 'PLN',
                odbiorca: 'Wynagrodzenie',
                kategoriaId: salaryCategory?.id,
                utworzonoPrzez: user.id,
            },
        ],
    });
    await prisma.planKonfiguracja.upsert({
        where: { plan: 'PRO' },
        update: { stripePriceId: process.env.STRIPE_PRICE_ID_PRO ?? 'price_xxx' },
        create: {
            plan: 'PRO',
            stripePriceId: process.env.STRIPE_PRICE_ID_PRO ?? 'price_xxx',
        },
    });
    await prisma.planKonfiguracja.upsert({
        where: { plan: 'FREE' },
        update: { stripePriceId: process.env.STRIPE_PRICE_ID_FREE ?? 'price_free' },
        create: {
            plan: 'FREE',
            stripePriceId: process.env.STRIPE_PRICE_ID_FREE ?? 'price_free',
        },
    });
    await prisma.logSystemowy.create({
        data: { poziom: 'INFO', wiadomosc: 'Seed zakończony.' },
    });
    return { admin, user, viewer };
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map