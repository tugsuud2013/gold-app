import { NestFactory } from '@nestjs/core';
import * as bcrypt from 'bcrypt';
import { AdminRole, ChatSenderType, ChatThreadStatus, KycStatus, MembershipLevel, NewsStatus, PurchaseStatus, QpayStatus, SellRequestStatus, UserStatus } from '@prisma/client';
import { AppModule } from './app.module';
import { GoldPriceService } from './gold-price/gold-price.service';
import { MembershipService } from './membership/membership.service';
import { PrismaService } from './prisma/prisma.service';

const BCRYPT_ROUNDS = 12;
const TEST_USER_PASSWORD = 'Test@12345';
const MOCK_UNIT_PRICE_MNT = 385420;

type MockPurchaseSeed = {
  id: string;
  orderNo: string;
  phoneNumber: string;
  amountGrams: number;
  status: PurchaseStatus;
  qpayStatus: QpayStatus;
  paidAt?: Date;
  createdAt: Date;
};

/** Deterministic IDs — re-running seed skips existing rows (no duplicates). */
const MOCK_PURCHASES: MockPurchaseSeed[] = [
  {
    id: 'a1000001-0001-4000-8000-000000000001',
    orderNo: '#A1000001',
    phoneNumber: '99001001',
    amountGrams: 0.5,
    status: PurchaseStatus.PENDING,
    qpayStatus: QpayStatus.PENDING,
    createdAt: new Date('2026-01-10T09:00:00.000Z'),
  },
  {
    id: 'a1000001-0001-4000-8000-000000000002',
    orderNo: '#A1000002',
    phoneNumber: '99001002',
    amountGrams: 1,
    status: PurchaseStatus.PENDING,
    qpayStatus: QpayStatus.PENDING,
    createdAt: new Date('2026-01-11T10:15:00.000Z'),
  },
  {
    id: 'a1000001-0001-4000-8000-000000000003',
    orderNo: '#A1000003',
    phoneNumber: '99001003',
    amountGrams: 1.5,
    status: PurchaseStatus.CONTRACT_SIGNED,
    qpayStatus: QpayStatus.PENDING,
    createdAt: new Date('2026-01-12T11:30:00.000Z'),
  },
  {
    id: 'a1000001-0001-4000-8000-000000000004',
    orderNo: '#A1000004',
    phoneNumber: '99001004',
    amountGrams: 2,
    status: PurchaseStatus.CONTRACT_SIGNED,
    qpayStatus: QpayStatus.PENDING,
    createdAt: new Date('2026-01-13T12:45:00.000Z'),
  },
  {
    id: 'a1000001-0001-4000-8000-000000000005',
    orderNo: '#A1000005',
    phoneNumber: '99001005',
    amountGrams: 2.5,
    status: PurchaseStatus.PAYMENT_PENDING,
    qpayStatus: QpayStatus.PENDING,
    createdAt: new Date('2026-01-14T08:00:00.000Z'),
  },
  {
    id: 'a1000001-0001-4000-8000-000000000006',
    orderNo: '#A1000006',
    phoneNumber: '99001006',
    amountGrams: 3.5,
    status: PurchaseStatus.PAYMENT_PENDING,
    qpayStatus: QpayStatus.PENDING,
    createdAt: new Date('2026-01-15T09:30:00.000Z'),
  },
  {
    id: 'a1000001-0001-4000-8000-000000000007',
    orderNo: '#A1000007',
    phoneNumber: '99001007',
    amountGrams: 5,
    status: PurchaseStatus.PAYMENT_PENDING,
    qpayStatus: QpayStatus.PAID,
    paidAt: new Date('2026-01-16T14:20:00.000Z'),
    createdAt: new Date('2026-01-16T13:00:00.000Z'),
  },
  {
    id: 'a1000001-0001-4000-8000-000000000008',
    orderNo: '#A1000008',
    phoneNumber: '99001008',
    amountGrams: 6,
    status: PurchaseStatus.PAYMENT_PENDING,
    qpayStatus: QpayStatus.PAID,
    paidAt: new Date('2026-01-17T16:45:00.000Z'),
    createdAt: new Date('2026-01-17T15:00:00.000Z'),
  },
  {
    id: 'a1000001-0001-4000-8000-000000000009',
    orderNo: '#A1000009',
    phoneNumber: '99001009',
    amountGrams: 8,
    status: PurchaseStatus.COMPLETED,
    qpayStatus: QpayStatus.PAID,
    paidAt: new Date('2026-01-18T11:10:00.000Z'),
    createdAt: new Date('2026-01-18T10:00:00.000Z'),
  },
  {
    id: 'a1000001-0001-4000-8000-000000000010',
    orderNo: '#A1000010',
    phoneNumber: '99001010',
    amountGrams: 10,
    status: PurchaseStatus.CANCELLED,
    qpayStatus: QpayStatus.FAILED,
    createdAt: new Date('2026-01-19T17:00:00.000Z'),
  },
];

type MockSellRequestSeed = {
  id: string;
  requestNo: string;
  phoneNumber: string;
  amountGrams: number;
  status: SellRequestStatus;
  approvedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
};

const MOCK_SELL_REQUESTS: MockSellRequestSeed[] = [
  {
    id: 's1000001-0001-4000-8000-000000000001',
    requestNo: '#S1000001',
    phoneNumber: '99001001',
    amountGrams: 0.5,
    status: SellRequestStatus.PENDING,
    createdAt: new Date('2026-02-01T09:00:00.000Z'),
  },
  {
    id: 's1000001-0001-4000-8000-000000000002',
    requestNo: '#S1000002',
    phoneNumber: '99001002',
    amountGrams: 1,
    status: SellRequestStatus.PENDING,
    createdAt: new Date('2026-02-02T10:00:00.000Z'),
  },
  {
    id: 's1000001-0001-4000-8000-000000000003',
    requestNo: '#S1000003',
    phoneNumber: '99001003',
    amountGrams: 1.5,
    status: SellRequestStatus.PENDING,
    createdAt: new Date('2026-02-03T11:00:00.000Z'),
  },
  {
    id: 's1000001-0001-4000-8000-000000000004',
    requestNo: '#S1000004',
    phoneNumber: '99001004',
    amountGrams: 2,
    status: SellRequestStatus.APPROVED,
    approvedAt: new Date('2026-02-04T14:00:00.000Z'),
    createdAt: new Date('2026-02-04T12:00:00.000Z'),
  },
  {
    id: 's1000001-0001-4000-8000-000000000005',
    requestNo: '#S1000005',
    phoneNumber: '99001005',
    amountGrams: 2.5,
    status: SellRequestStatus.APPROVED,
    approvedAt: new Date('2026-02-05T15:00:00.000Z'),
    createdAt: new Date('2026-02-05T13:00:00.000Z'),
  },
  {
    id: 's1000001-0001-4000-8000-000000000006',
    requestNo: '#S1000006',
    phoneNumber: '99001006',
    amountGrams: 3,
    status: SellRequestStatus.COMPLETED,
    approvedAt: new Date('2026-02-06T10:00:00.000Z'),
    completedAt: new Date('2026-02-06T16:00:00.000Z'),
    createdAt: new Date('2026-02-06T09:00:00.000Z'),
  },
  {
    id: 's1000001-0001-4000-8000-000000000007',
    requestNo: '#S1000007',
    phoneNumber: '99001007',
    amountGrams: 4,
    status: SellRequestStatus.COMPLETED,
    approvedAt: new Date('2026-02-07T11:00:00.000Z'),
    completedAt: new Date('2026-02-07T17:00:00.000Z'),
    createdAt: new Date('2026-02-07T10:00:00.000Z'),
  },
  {
    id: 's1000001-0001-4000-8000-000000000008',
    requestNo: '#S1000008',
    phoneNumber: '99001008',
    amountGrams: 5,
    status: SellRequestStatus.COMPLETED,
    approvedAt: new Date('2026-02-08T12:00:00.000Z'),
    completedAt: new Date('2026-02-08T18:00:00.000Z'),
    createdAt: new Date('2026-02-08T11:00:00.000Z'),
  },
  {
    id: 's1000001-0001-4000-8000-000000000009',
    requestNo: '#S1000009',
    phoneNumber: '99001009',
    amountGrams: 6,
    status: SellRequestStatus.CANCELLED,
    createdAt: new Date('2026-02-09T14:00:00.000Z'),
  },
  {
    id: 's1000001-0001-4000-8000-000000000010',
    requestNo: '#S1000010',
    phoneNumber: '99001010',
    amountGrams: 8,
    status: SellRequestStatus.CANCELLED,
    createdAt: new Date('2026-02-10T15:00:00.000Z'),
  },
];

type TestUserSeed = {
  phoneNumber: string;
  firstName: string;
  lastName: string;
  registerNumber: string;
  membershipLevel: MembershipLevel;
  kycStatus: KycStatus;
  status: UserStatus;
};

const TEST_USERS: TestUserSeed[] = [
  {
    phoneNumber: '99001001',
    firstName: 'Бат',
    lastName: 'Энх',
    registerNumber: 'AB010101',
    membershipLevel: MembershipLevel.NORMAL,
    kycStatus: KycStatus.VERIFIED,
    status: UserStatus.ACTIVE,
  },
  {
    phoneNumber: '99001002',
    firstName: 'Сара',
    lastName: 'Болд',
    registerNumber: 'AB010102',
    membershipLevel: MembershipLevel.NORMAL,
    kycStatus: KycStatus.PENDING,
    status: UserStatus.ACTIVE,
  },
  {
    phoneNumber: '99001003',
    firstName: 'Тэмүүлэн',
    lastName: 'Ган',
    registerNumber: 'AB010103',
    membershipLevel: MembershipLevel.NORMAL,
    kycStatus: KycStatus.REJECTED,
    status: UserStatus.ACTIVE,
  },
  {
    phoneNumber: '99001004',
    firstName: 'Оюун',
    lastName: 'Мөнх',
    registerNumber: 'AB010104',
    membershipLevel: MembershipLevel.SILVER,
    kycStatus: KycStatus.VERIFIED,
    status: UserStatus.ACTIVE,
  },
  {
    phoneNumber: '99001005',
    firstName: 'Наран',
    lastName: 'Цэцэг',
    registerNumber: 'AB010105',
    membershipLevel: MembershipLevel.SILVER,
    kycStatus: KycStatus.PENDING,
    status: UserStatus.ACTIVE,
  },
  {
    phoneNumber: '99001006',
    firstName: 'Эрдэнэ',
    lastName: 'Бат',
    registerNumber: 'AB010106',
    membershipLevel: MembershipLevel.SILVER,
    kycStatus: KycStatus.REJECTED,
    status: UserStatus.SUSPENDED,
  },
  {
    phoneNumber: '99001007',
    firstName: 'Алтан',
    lastName: 'Хишиг',
    registerNumber: 'AB010107',
    membershipLevel: MembershipLevel.GOLD,
    kycStatus: KycStatus.VERIFIED,
    status: UserStatus.ACTIVE,
  },
  {
    phoneNumber: '99001008',
    firstName: 'Мөнх',
    lastName: 'Очир',
    registerNumber: 'AB010108',
    membershipLevel: MembershipLevel.GOLD,
    kycStatus: KycStatus.PENDING,
    status: UserStatus.ACTIVE,
  },
  {
    phoneNumber: '99001009',
    firstName: 'Болор',
    lastName: 'Сувд',
    registerNumber: 'AB010109',
    membershipLevel: MembershipLevel.GOLD,
    kycStatus: KycStatus.REJECTED,
    status: UserStatus.ACTIVE,
  },
  {
    phoneNumber: '99001010',
    firstName: 'VIP',
    lastName: 'Гишүүн',
    registerNumber: 'AB010110',
    membershipLevel: MembershipLevel.GOLD,
    kycStatus: KycStatus.VERIFIED,
    status: UserStatus.ACTIVE,
  },
];

function randomBalanceGrams(): string {
  const grams = Math.round((Math.random() * 49.5 + 0.5) * 10000) / 10000;
  return grams.toFixed(4);
}

async function seedAdminUser(prisma: PrismaService): Promise<void> {
  const email = 'admin@goldapp.mn';
  const existing = await prisma.adminUser.findUnique({ where: { email } });

  if (!existing) {
    const passwordHash = await bcrypt.hash('Admin@2025', BCRYPT_ROUNDS);
    await prisma.adminUser.create({
      data: {
        email,
        passwordHash,
        name: 'Super Admin',
        role: AdminRole.SUPER_ADMIN,
      },
    });
    // eslint-disable-next-line no-console
    console.log(`Admin user seeded: ${email}`);
  } else {
    // eslint-disable-next-line no-console
    console.log(`Admin user already exists: ${email}`);
  }
}

async function seedTestUsers(prisma: PrismaService): Promise<void> {
  const passwordHash = await bcrypt.hash(TEST_USER_PASSWORD, BCRYPT_ROUNDS);
  let created = 0;
  let skipped = 0;

  for (const user of TEST_USERS) {
    const existing = await prisma.user.findUnique({
      where: { phoneNumber: user.phoneNumber },
      include: { wallet: true },
    });

    if (existing) {
      skipped += 1;
      continue;
    }

    const balanceGrams = randomBalanceGrams();

    await prisma.user.create({
      data: {
        phoneNumber: user.phoneNumber,
        passwordHash,
        firstName: user.firstName,
        lastName: user.lastName,
        registerNumber: user.registerNumber,
        kycStatus: user.kycStatus,
        membershipLevel: user.membershipLevel,
        status: user.status,
        wallet: {
          create: {
            balanceGrams,
            totalPurchasedGrams: balanceGrams,
            totalSoldGrams: '0.0000',
          },
        },
      },
    });

    created += 1;
    // eslint-disable-next-line no-console
    console.log(
      `Test user seeded: ${user.phoneNumber} (${user.membershipLevel}, ${user.kycStatus}, wallet ${balanceGrams}g)`,
    );
  }

  // eslint-disable-next-line no-console
  console.log(`Test users: ${created} created, ${skipped} skipped (already exist).`);
  // eslint-disable-next-line no-console
  console.log(`Test user password: ${TEST_USER_PASSWORD}`);
  // eslint-disable-next-line no-console
  console.log('Note: VIP user uses GOLD membership (schema has no VIP level). Wallet uses balanceGrams.');
}

function mockPurchaseTotalMnt(amountGrams: number): string {
  return (amountGrams * MOCK_UNIT_PRICE_MNT).toFixed(2);
}

function hasContract(status: PurchaseStatus): boolean {
  return (
    status === PurchaseStatus.CONTRACT_SIGNED ||
    status === PurchaseStatus.PAYMENT_PENDING ||
    status === PurchaseStatus.COMPLETED
  );
}

function hasQpayInvoice(status: PurchaseStatus, qpayStatus: QpayStatus): boolean {
  return (
    status === PurchaseStatus.PAYMENT_PENDING ||
    status === PurchaseStatus.COMPLETED ||
    qpayStatus === QpayStatus.PAID ||
    qpayStatus === QpayStatus.FAILED
  );
}

async function seedMockPurchases(prisma: PrismaService): Promise<void> {
  let created = 0;
  let skipped = 0;
  let updated = 0;
  let missingUser = 0;

  for (const mock of MOCK_PURCHASES) {
    const existing = await prisma.purchase.findUnique({ where: { id: mock.id } });
    if (existing) {
      if (existing.orderNo !== mock.orderNo) {
        await prisma.purchase.update({
          where: { id: mock.id },
          data: { orderNo: mock.orderNo },
        });
        updated += 1;
      } else {
        skipped += 1;
      }
      continue;
    }

    const user = await prisma.user.findUnique({ where: { phoneNumber: mock.phoneNumber } });
    if (!user) {
      missingUser += 1;
      // eslint-disable-next-line no-console
      console.log(`Mock purchase skipped (user not found): ${mock.phoneNumber}`);
      continue;
    }

    const amountGrams = mock.amountGrams.toFixed(4);
    const pricePerGram = MOCK_UNIT_PRICE_MNT.toFixed(2);
    const totalAmountMnt = mockPurchaseTotalMnt(mock.amountGrams);

    await prisma.purchase.create({
      data: {
        id: mock.id,
        orderNo: mock.orderNo,
        userId: user.id,
        amountGrams,
        pricePerGram,
        totalAmountMnt,
        status: mock.status,
        qpayStatus: mock.qpayStatus,
        qpayInvoiceId: hasQpayInvoice(mock.status, mock.qpayStatus)
          ? `SEED-QPAY-${mock.phoneNumber}`
          : null,
        contractPdfUrl: hasContract(mock.status)
          ? `/mock/contracts/${mock.id}.pdf`
          : null,
        contractQrCode: hasContract(mock.status) ? `SEED-QR-${mock.phoneNumber}` : null,
        paidAt: mock.paidAt ?? null,
        createdAt: mock.createdAt,
      },
    });

    created += 1;
    // eslint-disable-next-line no-console
    console.log(
      `Mock purchase seeded: ${mock.orderNo} · ${mock.phoneNumber} · ${mock.amountGrams}g · ${mock.status} · QPay ${mock.qpayStatus}`,
    );
  }

  // eslint-disable-next-line no-console
  console.log(
    `Mock purchases: ${created} created, ${updated} updated (orderNo), ${skipped} skipped (already exist), ${missingUser} skipped (no user).`,
  );
  // eslint-disable-next-line no-console
  console.log(
    'Purchase UI mapping: WAITING_PAYMENT = PAYMENT_PENDING; PAID = qpayStatus PAID (purchase still PAYMENT_PENDING until completed).',
  );
}

async function seedMockSellRequests(prisma: PrismaService): Promise<void> {
  let created = 0;
  let updated = 0;
  let skipped = 0;
  let missingUser = 0;

  for (const mock of MOCK_SELL_REQUESTS) {
    const user = await prisma.user.findUnique({ where: { phoneNumber: mock.phoneNumber } });
    if (!user) {
      missingUser += 1;
      // eslint-disable-next-line no-console
      console.log(`Mock sell request skipped (user not found): ${mock.phoneNumber}`);
      continue;
    }

    const existing = await prisma.sellRequest.findUnique({ where: { id: mock.id } });
    if (existing) {
      const patch: {
        requestNo?: string;
        userId?: string;
        pricePerGram?: string;
        totalAmountMnt?: string;
      } = {};

      if (existing.requestNo !== mock.requestNo) patch.requestNo = mock.requestNo;
      if (existing.userId !== user.id) patch.userId = user.id;
      if (!existing.pricePerGram) patch.pricePerGram = MOCK_UNIT_PRICE_MNT.toFixed(2);
      if (!existing.totalAmountMnt) {
        patch.totalAmountMnt = (mock.amountGrams * MOCK_UNIT_PRICE_MNT).toFixed(2);
      }

      if (Object.keys(patch).length > 0) {
        await prisma.sellRequest.update({
          where: { id: mock.id },
          data: patch,
        });
        updated += 1;
      } else {
        skipped += 1;
      }
      continue;
    }

    const amountGrams = mock.amountGrams.toFixed(4);
    const pricePerGram = MOCK_UNIT_PRICE_MNT.toFixed(2);
    const totalAmountMnt = (mock.amountGrams * MOCK_UNIT_PRICE_MNT).toFixed(2);

    await prisma.sellRequest.create({
      data: {
        id: mock.id,
        requestNo: mock.requestNo,
        userId: user.id,
        amountGrams,
        pricePerGram,
        totalAmountMnt,
        status: mock.status,
        approvedAt: mock.approvedAt ?? null,
        completedAt: mock.completedAt ?? null,
        createdAt: mock.createdAt,
      },
    });

    created += 1;
    console.log(
      `Mock sell request seeded: ${mock.requestNo} · ${mock.phoneNumber} · ${mock.amountGrams}g · ${mock.status}`,
    );
  }

  console.log(
    `Mock sell requests: ${created} created, ${updated} updated (requestNo), ${skipped} skipped, ${missingUser} skipped (no user).`,
  );
}

async function seedMockNews(prisma: PrismaService): Promise<void> {
  const admin = await prisma.adminUser.findUnique({ where: { email: 'admin@goldapp.mn' } });
  const adminId = admin?.id ?? null;

  const mockNews = [
    {
      id: 'n1000001-0001-4000-8000-000000000001',
      title: 'Алтны ханш сарын эхэнд өссөн',
      summary: 'Монголбанкны алтны ханш 460,000₮ түвшинд хүрлээ.',
      status: NewsStatus.PUBLISHED,
      tags: ['алт', 'ханш'],
      slug: 'altnii-hans-saryn-exend-orson',
      daysAgo: 2,
    },
    {
      id: 'n1000001-0001-4000-8000-000000000002',
      title: 'GoldApp шинэ хувилбар гарлаа',
      summary: 'Худалдан авах, зарах урсгал сайжирлаа.',
      status: NewsStatus.PUBLISHED,
      tags: ['app', 'шинэчлэл'],
      slug: 'goldapp-shine-huvilbar-garlaa',
      daysAgo: 5,
    },
    {
      id: 'n1000001-0001-4000-8000-000000000003',
      title: 'QPay төлбөрийн амжилт 99% хүрлээ',
      summary: 'Системийн төлбөрийн амжилттай байдал нэмэгдлээ.',
      status: NewsStatus.PUBLISHED,
      tags: ['qpay', 'төлбөр'],
      slug: 'qpay-tulburiin-amjilttai',
      daysAgo: 8,
    },
    {
      id: 'n1000001-0001-4000-8000-000000000004',
      title: 'Алт хадгалах зөвлөмж',
      summary: 'Алтны хадгалалтын найдвартай арга замууд.',
      status: NewsStatus.PUBLISHED,
      tags: ['зөвлөмж'],
      slug: 'alt-hadgalah-zuvlomj',
      daysAgo: 12,
    },
    {
      id: 'n1000001-0001-4000-8000-000000000005',
      title: 'Гишүүнчлэлийн шинэ давуу эрх',
      summary: 'Алтан гишүүдэд зориулсан шинэ урамшуулал.',
      status: NewsStatus.DRAFT,
      tags: ['гишүүнчлэл'],
      slug: 'gishuunchleliin-shine-davuu-erh',
      daysAgo: 1,
    },
    {
      id: 'n1000001-0001-4000-8000-000000000006',
      title: '2026 оны алтны тайлан',
      summary: 'I улирлын алтны зах зээлийн тойм.',
      status: NewsStatus.DRAFT,
      tags: ['тайлан'],
      slug: '2026-altnii-tailan',
      daysAgo: 0,
    },
    {
      id: 'n1000001-0001-4000-8000-000000000007',
      title: 'Аюулгүй байдлын шинэчлэлт',
      summary: 'KYC баталгаажуулалт сайжирлаа.',
      status: NewsStatus.PUBLISHED,
      tags: ['аюулгүй байдал'],
      slug: 'ayuulgui-baidliin-shinechlelt',
      daysAgo: 15,
    },
    {
      id: 'n1000001-0001-4000-8000-000000000008',
      title: 'Хуучин мэдээний архив',
      summary: '2025 оны мэдээний архив бэлэн боллоо.',
      status: NewsStatus.ARCHIVED,
      tags: ['архив'],
      slug: 'huuchin-medeenii-arhiv',
      daysAgo: 60,
    },
    {
      id: 'n1000001-0001-4000-8000-000000000009',
      title: 'Алтны зах зээлийн анализ',
      summary: 'Дэлхийн зах зээлийн тойм, дотоодын нөлөө.',
      status: NewsStatus.ARCHIVED,
      tags: ['анализ'],
      slug: 'altnii-zah-zeeliin-analiz',
      daysAgo: 90,
    },
    {
      id: 'n1000001-0001-4000-8000-000000000010',
      title: 'GoldApp хэрэглэгч 10,000-д хүрлээ',
      summary: 'Бид 10,000 дахь хэрэглэгчидээ угтаж байна.',
      status: NewsStatus.PUBLISHED,
      tags: ['хэрэглэгч'],
      slug: 'goldapp-hereglegch-10000',
      daysAgo: 20,
    },
  ];

  let created = 0;
  for (const [index, mock] of mockNews.entries()) {
    const existing = await prisma.news.findUnique({ where: { id: mock.id } });
    if (existing) continue;

    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - mock.daysAgo);
    const isPublished = mock.status === NewsStatus.PUBLISHED;
    const imageUrl = `https://picsum.photos/seed/goldapp-news-${index + 1}/800/450`;

    await prisma.news.create({
      data: {
        id: mock.id,
        title: mock.title,
        summary: mock.summary,
        content: `<p>${mock.summary}</p><p>GoldApp платформын албан ёсны мэдээ. Дэлгэрэнгүй мэдээллийг апп эсвэл вэбээс үзнэ үү.</p>`,
        coverImageUrl: imageUrl,
        imageUrls: [imageUrl, `https://picsum.photos/seed/goldapp-news-g-${index + 1}/800/450`],
        status: mock.status,
        isPublished,
        publishedAt: isPublished ? createdAt : null,
        tags: mock.tags,
        slug: mock.slug,
        metaTitle: mock.title,
        metaDescription: mock.summary,
        adminId,
        createdAt,
        updatedAt: createdAt,
      },
    });
    created += 1;
  }

  console.log(`Mock news: ${created} created.`);
}

type MockChatSeed = {
  phoneNumber: string;
  status: ChatThreadStatus;
  unreadByAdmin: number;
  messages: Array<{ from: 'USER' | 'ADMIN'; text: string }>;
};

const MOCK_CHATS: MockChatSeed[] = [
  {
    phoneNumber: '99001001',
    status: ChatThreadStatus.OPEN,
    unreadByAdmin: 2,
    messages: [
      { from: 'USER', text: 'Сайн байна уу, алт хэрхэн авах вэ?' },
      { from: 'ADMIN', text: 'Сайн байна уу! Худалдан авалт хэсэгт орж захиалга үүсгэнэ үү.' },
      { from: 'USER', text: 'QPay-ээр төлбөр хийхэд хэдэн минут зарцуулдаг вэ?' },
      { from: 'USER', text: 'Төлбөр хийсэн ч статус өөрчлөгдөхгүй байна.' },
    ],
  },
  {
    phoneNumber: '99001002',
    status: ChatThreadStatus.OPEN,
    unreadByAdmin: 1,
    messages: [
      { from: 'USER', text: 'KYC баталгаажуулалт хэзээ дуусах вэ?' },
      { from: 'ADMIN', text: '1-2 ажлын өдөрт шийдэгдэнэ.' },
      { from: 'USER', text: 'Баримт дахин илгээх шаардлагатай юу?' },
    ],
  },
  {
    phoneNumber: '99001003',
    status: ChatThreadStatus.CLOSED,
    unreadByAdmin: 0,
    messages: [
      { from: 'USER', text: 'Гэрээ PDF татаж чадахгүй байна' },
      { from: 'ADMIN', text: 'Асуудлыг шийдлээ. Дахин оролдоно уу.' },
      { from: 'USER', text: 'Боллоо, амжилттай татлаа. Баярлалаа!' },
    ],
  },
  {
    phoneNumber: '99001004',
    status: ChatThreadStatus.OPEN,
    unreadByAdmin: 3,
    messages: [
      { from: 'USER', text: 'Алтны ханш өнөөдөр өсөх үү?' },
      { from: 'USER', text: 'Зарах хүсэлт илгээсэн' },
      { from: 'USER', text: 'Хэзээ баталгаажих вэ?' },
      { from: 'ADMIN', text: 'Зарах хүсэлт 24 цагийн дотор хянана.' },
      { from: 'USER', text: 'Ойлголоо, хүлээж байна.' },
    ],
  },
  {
    phoneNumber: '99001005',
    status: ChatThreadStatus.OPEN,
    unreadByAdmin: 0,
    messages: [
      { from: 'USER', text: 'Membership level хэрхэн ахих вэ?' },
      { from: 'ADMIN', text: 'Илүү их алт худалдан авбал түвшин ахина.' },
      { from: 'USER', text: 'Ойлголоо, баярлалаа.' },
    ],
  },
  {
    phoneNumber: '99001006',
    status: ChatThreadStatus.CLOSED,
    unreadByAdmin: 0,
    messages: [
      { from: 'USER', text: 'Апп нээгдэхгүй байна' },
      { from: 'ADMIN', text: 'Шинэчлэлт хийгээд дахин оролдоно уу.' },
      { from: 'USER', text: 'Засагдлаа, ажиллаж байна.' },
    ],
  },
  {
    phoneNumber: '99001007',
    status: ChatThreadStatus.OPEN,
    unreadByAdmin: 1,
    messages: [
      { from: 'USER', text: 'Портфолио үлдэгдэл буруу харагдаж байна' },
      { from: 'ADMIN', text: 'Шалгаж байна, түр хүлээнэ үү.' },
      { from: 'USER', text: 'Одоо ч 0 гр харагдаж байна.' },
    ],
  },
  {
    phoneNumber: '99001008',
    status: ChatThreadStatus.OPEN,
    unreadByAdmin: 0,
    messages: [
      { from: 'USER', text: 'Баярлалаа, асуудал шийдэгдлээ' },
      { from: 'ADMIN', text: 'Танд баярлалаа!' },
    ],
  },
  {
    phoneNumber: '99001009',
    status: ChatThreadStatus.OPEN,
    unreadByAdmin: 2,
    messages: [
      { from: 'USER', text: 'KYC-г минь дахин илгээх үү?' },
      { from: 'ADMIN', text: 'Тийм, профайл хэсэгт ороод шинэчилнэ үү.' },
      { from: 'USER', text: 'Ямар баримт хэрэгтэй вэ?' },
      { from: 'USER', text: 'Иргэний үнэмлэхийн зураг хангалттай юу?' },
    ],
  },
  {
    phoneNumber: '99001010',
    status: ChatThreadStatus.OPEN,
    unreadByAdmin: 1,
    messages: [
      { from: 'USER', text: 'VIP гишүүнчлэлийн давуу тал юу вэ?' },
      { from: 'ADMIN', text: 'Gold түвшинд ханшийн онцгой мэдээлэл, priority дэмжлэг байдаг.' },
      { from: 'USER', text: 'Хэдэн грамм алт авбал Gold болох вэ?' },
    ],
  },
];

async function seedMockChats(prisma: PrismaService): Promise<void> {
  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const mock of MOCK_CHATS) {
    const user = await prisma.user.findUnique({ where: { phoneNumber: mock.phoneNumber } });
    if (!user) {
      skipped += 1;
      continue;
    }

    await prisma.chatMessage.deleteMany({ where: { userId: user.id } });

    const baseDate = new Date('2026-02-15T08:00:00.000Z');
    let lastAt = baseDate;
    let lastText = mock.messages[0]?.text ?? '';

    for (let i = 0; i < mock.messages.length; i += 1) {
      const item = mock.messages[i];
      const createdAt = new Date(baseDate.getTime() + i * 3600000);
      lastAt = createdAt;
      lastText = item.text;
      await prisma.chatMessage.create({
        data: {
          userId: user.id,
          message: item.text,
          senderType: item.from === 'ADMIN' ? ChatSenderType.ADMIN : ChatSenderType.USER,
          createdAt,
        },
      });
    }

    const preview = lastText.length > 120 ? `${lastText.slice(0, 117)}...` : lastText;
    const existing = await prisma.chatThread.findUnique({ where: { userId: user.id } });

    await prisma.chatThread.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        status: mock.status,
        lastMessageAt: lastAt,
        lastMessageText: preview,
        unreadByAdmin: mock.unreadByAdmin,
        adminLastReadAt: mock.unreadByAdmin === 0 ? lastAt : null,
      },
      update: {
        status: mock.status,
        lastMessageAt: lastAt,
        lastMessageText: preview,
        unreadByAdmin: mock.unreadByAdmin,
        adminLastReadAt: mock.unreadByAdmin === 0 ? lastAt : null,
      },
    });

    if (existing) updated += 1;
    else created += 1;
  }

  console.log(`Mock chats: ${created} created, ${updated} updated, ${skipped} skipped (no user).`);
}

async function seed(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule);
  try {
    const prisma = app.get(PrismaService);
    const goldPriceService = app.get(GoldPriceService);
    const membershipService = app.get(MembershipService);

    await seedAdminUser(prisma);
    await seedTestUsers(prisma);
    await seedMockPurchases(prisma);
    await seedMockSellRequests(prisma);
    await seedMockNews(prisma);
    await seedMockChats(prisma);
    await goldPriceService.seedTestData();
    await membershipService.seedDefaultConfig();
  } finally {
    await app.close();
  }
}

seed()
  .then(() => {
    // eslint-disable-next-line no-console
    console.log('Seed completed');
  })
  .catch((error: unknown) => {
    // eslint-disable-next-line no-console
    console.error('Seed failed', error);
    process.exit(1);
  });
