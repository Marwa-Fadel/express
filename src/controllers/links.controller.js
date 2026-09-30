
const linksService = require('../services/links.service');

// POST /links
async function createLink(req, res) {

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
    return res.status(400).json({ error: 'originalUrl لازم يبدأ بـ http:// أو https:// بس' });
  }

  const link = await linksService.createLink(originalUrl);

  res.status(201).json({
    code: link.code,
    originalUrl: link.originalUrl,
    shortUrl: `${req.protocol}://${req.get('host')}/${link.code}`,
  });
}

// GET /:code - إعادة توجيه للرابط الأصلي + تسجيل نقرة
async function redirectToOriginal(req, res) {
  const { code } = req.params;

  const link = await linksService.getLinkAndRecordClick(code);

  if (!link) {
    return res.status(404).json({ error: 'الرابط غير موجود' });
  }

  res.redirect(302, link.originalUrl);
}

// GET /:code/stats
async function getStats(req, res) {
  const { code } = req.params;

  const stats = await linksService.getStats(code);

  if (!stats) {
    return res.status(404).json({ error: 'الرابط غير موجود' });
  }

  res.json(stats);
}

module.exports = { createLink, redirectToOriginal, getStats };
