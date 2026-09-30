// لازم يكون أول سطر - Prisma 7 ما بيحمّل .env تلقائياً وقت التشغيل
require('dotenv/config');

const express = require('express');
const cors = require('cors');
const linksRouter = require('./routes/links.routes');

const app = express();
app.use(cors());
app.use(express.json());

// نقطة فحص بسيطة (health check) - ممارسة معتادة بأي API حقيقي
app.get('/', (req, res) => {
  res.json({ service: 'url-shortener', status: 'ok' });
});

app.use('/', linksRouter);

// أي مسار تاني مش معرّف فوق
app.use((req, res) => {
  res.status(404).json({ error: 'المسار غير موجود' });
});

app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'الجسم المرسل (body) لازم يكون JSON صحيح' });
  }

  // لو حدا بعت body أكبر من الحد المسموح (express.json() افتراضياً 100kb)
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'الجسم المرسل (body) أكبر من الحجم المسموح' });
  }

  console.error(err);
  res.status(500).json({ error: 'حدث خطأ غير متوقع بالسيرفر' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`url-shortener running on http://localhost:${PORT}`);
});
