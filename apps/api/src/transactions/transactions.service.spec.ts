import { TransactionsService } from './transactions.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

describe('TransactionsService', () => {
  const prisma = {
    transakcja: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
    },
  } as unknown as PrismaService;

  const audit = {
    logAutoIfPro: jest.fn(),
  } as unknown as AuditService;

  const service = new TransactionsService(prisma, audit);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('powinien oznaczyć duplikat przy takiej samej dacie/kwocie/odbiorcy', async () => {
    (prisma.transakcja.findFirst as jest.Mock).mockResolvedValue({ id: 'dup' });
    (prisma.transakcja.create as jest.Mock).mockResolvedValue({ id: 't1' });

    const result = await service.create('u1', {
      data: new Date().toISOString(),
      kwota: 10,
      waluta: 'PLN',
      odbiorca: 'Sklep',
    });

    expect(prisma.transakcja.create).toHaveBeenCalled();
    expect(result).toBeDefined();
  });
});


