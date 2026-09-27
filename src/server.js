// لازم يكون أول سطر - Prisma 7 ما بيحمّل .env تلقائياً وقت التشغيل
require('dotenv/config');

const express = require('express');
const { nanoid } = require('nanoid');
const prisma = require('./prismaClient');

const app = express();
app.use(express.json());

function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// POST /links - إنشاء رابط مختصر جديد
app.post(
  '/links',
  asyncHandler(async (req, res) => {
   
    const { originalUrl } = req.body || {};

    if (!originalUrl || typeof originalUrl !== 'string') {
      return res.status(400).json({ error: 'originalUrl مطلوب ولازم يكون نص' });
    }

    let parsedUrl;
    try {
      parsedUrl = new URL(originalUrl);
    } catch {
      return res
        .status(400)
        .json({ error: 'originalUrl لازم يكون رابط صحيح (يبدأ بـ http:// أو https://)' });
    }

    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      return res
        .status(400)
        .json({ error: 'originalUrl لازم يبدأ بـ http:// أو https:// بس' });
    }

    const code = nanoid(7);

    const link = await prisma.link.create({
      data: { code, originalUrl },
    });

    res.status(201).json({
      code: link.code,
      originalUrl: link.originalUrl,
      shortUrl: `${req.protocol}://${req.get('host')}/${link.code}`,
    });
  }),
);

app.get(
  '/:code/stats',
  asyncHandler(async (req, res) => {
    const { code } = req.params;

    const link = await prisma.link.findUnique({
      where: { code },
      include: { clicks: { orderBy: { clickedAt: 'desc' } } },
    });

    if (!link) {
      return res.status(404).json({ error: 'الرابط غير موجود' });
    }

    res.json({
      code: link.code,
      originalUrl: link.originalUrl,
      createdAt: link.createdAt,
      totalClicks: link.clicks.length,
      clicks: link.clicks.map((c) => ({ clickedAt: c.clickedAt })),
    });
  }),
);

// GET /:code - إعادة توجيه للرابط الأصلي + تسجيل نقرة جديدة
app.get(
  '/:code',
  asyncHandler(async (req, res) => {
    const { code } = req.params;

    const link = await prisma.link.findUnique({ where: { code } });

    if (!link) {
      return res.status(404).json({ error: 'الرابط غير موجود' });
    }

    await prisma.click.create({ data: { linkId: link.id } });

    res.redirect(302, link.originalUrl);
  }),
);

// أي مسار تاني مش معرّف فوق
app.use((req, res) => {
  res.status(404).json({ error: 'المسار غير موجود' });
});

app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'الجسم المرسل (body) لازم يكون JSON صحيح' });
  }

  console.error(err);
  res.status(500).json({ error: 'حدث خطأ غير متوقع بالسيرفر' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`url-shortener running on http://localhost:${PORT}`);
});
