
const { nanoid } = require('nanoid');
const prisma = require('../prismaClient');

// إنشاء رابط مختصر جديد
async function createLink(originalUrl) {
  const code = nanoid(7);
  return prisma.link.create({
    data: { code, originalUrl },
  });
}

async function getLinkAndRecordClick(code) {
  const link = await prisma.link.findUnique({ where: { code } });

  if (!link) {
    return null;
  }

  await prisma.click.create({ data: { linkId: link.id } });

  return link;
}

// إحصائيات رابط معيّن
async function getStats(code) {
  const link = await prisma.link.findUnique({
    where: { code },
    include: { clicks: { orderBy: { clickedAt: 'desc' } } },
  });

  if (!link) {
    return null;
  }

  return {
    code: link.code,
    originalUrl: link.originalUrl,
    createdAt: link.createdAt,
    totalClicks: link.clicks.length,
    clicks: link.clicks.map((c) => ({ clickedAt: c.clickedAt })),
  };
}

module.exports = { createLink, getLinkAndRecordClick, getStats };
