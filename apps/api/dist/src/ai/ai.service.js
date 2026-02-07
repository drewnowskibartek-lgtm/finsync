"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AiService = class AiService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async buildMonthlySummary(userId, months = 12) {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);
        const transactions = await this.prisma.transakcja.findMany({
            where: { userId, data: { gte: start } },
            select: { data: true, kwota: true },
        });
        const map = new Map();
        for (let i = months - 1; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            map.set(key, { przychody: 0, wydatki: 0, saldo: 0 });
        }
        for (const t of transactions) {
            const d = new Date(t.data);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            if (!map.has(key))
                continue;
            const val = Number(t.kwota);
            const entry = map.get(key);
            if (val >= 0)
                entry.przychody += val;
            else
                entry.wydatki += Math.abs(val);
            entry.saldo = entry.przychody - entry.wydatki;
        }
        return Array.from(map.entries()).map(([miesiac, v]) => ({
            miesiac,
            przychody: Number(v.przychody.toFixed(2)),
            wydatki: Number(v.wydatki.toFixed(2)),
            saldo: Number(v.saldo.toFixed(2)),
        }));
    }
    sanitizeForHelp(transactions) {
        return transactions.map((t) => ({
            id: t.id,
            data: t.data,
            kwota: t.kwota,
            waluta: t.waluta,
            kategoria: t.kategoria?.nazwa ?? null,
            metoda: t.metoda ?? null,
            odbiorca: undefined,
            referencja: undefined,
            notatka: undefined,
        }));
    }
    async callGemini(model, contents) {
        const apiKey = process.env.GEMINI_API_KEY;
        const base = process.env.GEMINI_BASE_URL ??
            'https://generativelanguage.googleapis.com/v1beta';
        if (!apiKey) {
            throw new common_1.InternalServerErrorException('Brak konfiguracji GEMINI_API_KEY.');
        }
        let res;
        try {
            res = await fetch(`${base}/models/${model}:generateContent`, {
                method: 'POST',
                headers: {
                    'x-goog-api-key': apiKey,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ contents }),
            });
        }
        catch {
            throw new common_1.InternalServerErrorException('Nie udało się połączyć z AI.');
        }
        if (!res.ok) {
            let bodyText = '';
            let message = `Błąd komunikacji z AI (HTTP ${res.status}).`;
            try {
                bodyText = await res.text();
                const parsed = JSON.parse(bodyText);
                const apiMessage = parsed?.error?.message ??
                    parsed?.message ??
                    parsed?.error ??
                    undefined;
                if (res.status === 401 || res.status === 403) {
                    message = 'Błędny lub nieaktywny klucz Gemini.';
                }
                else if (res.status === 429) {
                    message = 'Limit zapytań do AI został przekroczony. Spróbuj później.';
                }
                else if (typeof apiMessage === 'string') {
                    message = `Błąd komunikacji z AI: ${apiMessage}`;
                }
            }
            catch {
            }
            console.error('Gemini error', {
                status: res.status,
                body: bodyText?.slice(0, 500),
            });
            throw new common_1.InternalServerErrorException(message);
        }
        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.find((p) => p.text)?.text ??
            '';
        return text;
    }
    async callOpenAi(system, user) {
        const model = process.env.GEMINI_MODEL ?? 'gemini-2.5-flash';
        return this.callGemini(model, [
            {
                role: 'user',
                parts: [{ text: `${system}\n\n${user}` }],
            },
        ]);
    }
    async callOpenAiWithImage(system, user, imageBase64, mime) {
        const model = process.env.GEMINI_VISION_MODEL ?? 'gemini-2.5-flash';
        return this.callGemini(model, [
            {
                role: 'user',
                parts: [
                    { inline_data: { mime_type: mime, data: imageBase64 } },
                    { text: `${system}\n\n${user}` },
                ],
            },
        ]);
    }
    async checkLimit(userId) {
        const sub = await this.prisma.subskrypcja.findUnique({ where: { userId } });
        const limit = sub?.plan === 'PRO'
            ? Number(process.env.AI_DAILY_LIMIT_PRO ?? 200)
            : Number(process.env.AI_DAILY_LIMIT_FREE ?? 20);
        const todayStr = new Date().toISOString().slice(0, 10);
        const today = new Date(todayStr);
        const usage = await this.prisma.aiUzycie.upsert({
            where: { userId_data: { userId, data: today } },
            update: { licznik: { increment: 1 } },
            create: { userId, data: today, licznik: 1 },
        });
        if (usage.licznik > limit) {
            throw new common_1.ForbiddenException('Przekroczono dzienny limit zapytań AI. Spróbuj jutro.');
        }
        return sub?.plan ?? 'FREE';
    }
    async chat(userId, message, mode) {
        const plan = await this.checkLimit(userId);
        const systemByMode = {
            help: 'Jesteś asystentem FinSync. Odpowiadasz po polsku, krótko i praktycznie. ' +
                'Znasz funkcje aplikacji i tłumaczysz je krok po kroku. ' +
                'Jeśli pytanie nie dotyczy aplikacji, powiedz wprost, że nie masz danych. ' +
                'Gdy użytkownik zgłasza problem z AI (np. brak odpowiedzi, limit, błąd), ' +
                'podaj przyczyny: limit dzienny, brak klucza, błąd sieci, zły format, ' +
                'i zaproponuj konkretne kroki naprawy.',
            analysis: 'Jesteś analitykiem budżetu. Odpowiadasz po polsku. ' +
                'Wyciągaj wnioski i proponuj rekomendacje. Jeśli brakuje danych, pytaj o nie.',
            report: 'Tworzysz raport tekstowy budżetu. Odpowiadasz po polsku, zwięźle, punktowo.',
        };
        const [transactions, budgets, categories, recurring, sub, allTime, monthlySummary,] = await Promise.all([
            this.prisma.transakcja.findMany({
                where: { userId },
                include: { kategoria: true },
                orderBy: { data: 'desc' },
                take: 200,
            }),
            this.prisma.budzet.findMany({
                where: { userId },
                include: { kategoria: true },
                orderBy: [{ rok: 'desc' }, { miesiac: 'desc' }],
                take: 50,
            }),
            this.prisma.kategoria.findMany({
                where: { OR: [{ globalna: true }, { userId }] },
            }),
            this.prisma.recurring.findMany({
                where: { userId },
                orderBy: { nastepnaData: 'asc' },
            }),
            this.prisma.subskrypcja.findUnique({ where: { userId } }),
            this.prisma.transakcja.aggregate({
                where: { userId },
                _sum: { kwota: true },
            }),
            this.buildMonthlySummary(userId, 12),
        ]);
        const budzetLacznie = Number(allTime._sum.kwota ?? 0);
        const txForMode = mode === 'help' ? this.sanitizeForHelp(transactions) : transactions;
        const user = `Użytkownik: ${userId}, plan: ${sub?.plan ?? plan}.\n` +
            `Pytanie: ${message}\n\n` +
            `Uwaga: w trybie "help" ukryto pola wrażliwe (odbiorca/referencja/notatka).\n` +
            `Budżet łączny (przychody-wydatki, narastająco): ${budzetLacznie}\n` +
            `Transakcje (ostatnie 200): ${JSON.stringify(txForMode)}\n` +
            `Budżety: ${JSON.stringify(budgets)}\n` +
            `Kategorie: ${JSON.stringify(categories)}\n` +
            `Cykliczne płatności: ${JSON.stringify(recurring)}\n` +
            `Podsumowanie miesięczne (12 m-cy): ${JSON.stringify(monthlySummary)}`;
        return this.callOpenAi(systemByMode[mode], user);
    }
    async report(userId) {
        await this.checkLimit(userId);
        const start = new Date();
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        const end = new Date(start);
        end.setMonth(start.getMonth() + 1);
        const [transactions, budgets, categories, sub] = await Promise.all([
            this.prisma.transakcja.findMany({
                where: { userId, data: { gte: start, lt: end } },
                include: { kategoria: true },
                orderBy: { data: 'desc' },
                take: 200,
            }),
            this.prisma.budzet.findMany({
                where: {
                    userId,
                    rok: start.getFullYear(),
                    miesiac: start.getMonth() + 1,
                },
                include: { kategoria: true },
            }),
            this.prisma.kategoria.findMany({
                where: { OR: [{ globalna: true }, { userId }] },
            }),
            this.prisma.subskrypcja.findUnique({ where: { userId } }),
        ]);
        const system = 'Jesteś analitykiem budżetu. Odpowiadasz po polsku. ' +
            'Daj 3-5 konkretnych wniosków i 3 rekomendacje. ' +
            'Używaj liczb z danych. Zwróć uwagę na budżety przekroczone lub bliskie limitu.';
        const user = `Plan: ${sub?.plan ?? 'FREE'}.\n` +
            `Transakcje (bieżący miesiąc, max 200): ${JSON.stringify(transactions)}\n` +
            `Budżety: ${JSON.stringify(budgets)}\n` +
            `Kategorie: ${JSON.stringify(categories)}\n` +
            'Przygotuj krótką analizę oraz rekomendacje.';
        return this.callOpenAi(system, user);
    }
    async parseReceipt(userId, imageBuffer, mime) {
        await this.checkLimit(userId);
        if (!mime.startsWith('image/')) {
            throw new common_1.BadRequestException('Dozwolone są tylko pliki obrazów.');
        }
        const base64 = imageBuffer.toString('base64');
        const system = 'Jesteś asystentem OCR. Zwróć tylko JSON bez dodatkowego tekstu. ' +
            'Jeśli pola są niepewne, ustaw je na null. ' +
            'Pola: data (YYYY-MM-DD), kwota (liczba), waluta (3-litery), ' +
            'odbiorca, metoda, notatka oraz confidence (obiekt z wartościami 0-1 dla każdego pola).';
        const user = 'Wyciągnij dane z paragonu lub faktury. Zwróć tylko poprawny JSON. ' +
            'Dodaj confidence dla każdego pola, np. { confidence: { kwota: 0.82 } }.';
        const raw = await this.callOpenAiWithImage(system, user, base64, mime);
        const cleaned = raw
            .trim()
            .replace(/^```json/i, '')
            .replace(/^```/i, '')
            .replace(/```$/i, '')
            .trim();
        try {
            const parsed = JSON.parse(cleaned);
            return {
                data: parsed.data ?? undefined,
                kwota: parsed.kwota !== undefined && parsed.kwota !== null
                    ? Number(parsed.kwota)
                    : undefined,
                waluta: parsed.waluta ?? undefined,
                odbiorca: parsed.odbiorca ?? undefined,
                metoda: parsed.metoda ?? undefined,
                notatka: parsed.notatka ?? undefined,
                confidence: parsed.confidence && typeof parsed.confidence === 'object'
                    ? {
                        data: parsed.confidence.data !== undefined
                            ? Number(parsed.confidence.data)
                            : undefined,
                        kwota: parsed.confidence.kwota !== undefined
                            ? Number(parsed.confidence.kwota)
                            : undefined,
                        waluta: parsed.confidence.waluta !== undefined
                            ? Number(parsed.confidence.waluta)
                            : undefined,
                        odbiorca: parsed.confidence.odbiorca !== undefined
                            ? Number(parsed.confidence.odbiorca)
                            : undefined,
                        metoda: parsed.confidence.metoda !== undefined
                            ? Number(parsed.confidence.metoda)
                            : undefined,
                        notatka: parsed.confidence.notatka !== undefined
                            ? Number(parsed.confidence.notatka)
                            : undefined,
                    }
                    : undefined,
            };
        }
        catch {
            throw new common_1.InternalServerErrorException('Nie udało się przetworzyć odpowiedzi AI.');
        }
    }
};
exports.AiService = AiService;
exports.AiService = AiService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AiService);
//# sourceMappingURL=ai.service.js.map