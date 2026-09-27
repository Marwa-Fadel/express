# url-shortener

مختصر روابط بسيط بـ **Express + Prisma 7**
## الفكرة

- `POST /links` — تاخد رابط طويل، بترجع رابط قصير (كود عشوائي)
- `GET /:code` — بتعمل redirect (302) للرابط الأصلي، وبنفس اللحظة بتسجّل نقرة جديدة
- `GET /:code/stats` — بترجع عدد النقرات وتفاصيلها لكل رابط


## اختبار الـ endpoints

إنشاء رابط مختصر:
```
curl -X POST http://localhost:3000/links -H "Content-Type: application/json" -d "{\"originalUrl\":\"https://www.google.com\"}"
```
(الرد رح يعطيكي `code` و`shortUrl` — احتفظي بالـ code لاستخدامه بالخطوات الجاية)

فتح الرابط المختصر (رح يعمل redirect لجوجل، وبنفس الوقت يسجّل نقرة):
```
curl -i http://localhost:3000/<الكود>
```
(`-i` عشان تشوفي الـ response headers وتتأكدي إنه `302 Found` مع `Location: https://www.google.com`)

عرض الإحصائيات:
```
curl http://localhost:3000/<الكود>/stats
```

رابط غير موجود (لازم يرجع 404):
```
curl http://localhost:3000/codemalus
```

رابط بصيغة غلط (لازم يرجع 400):
```
curl -X POST http://localhost:3000/links -H "Content-Type: application/json" -d "{\"originalUrl\":\"مش رابط\"}"
```

## بنية المشروع

```
prisma.config.ts        إعدادات Prisma 7 (فيه رابط الاتصال بقاعدة البيانات)
prisma/schema.prisma     نموذج البيانات: Link و Click (علاقة one-to-many)
generated/prisma/        كود Prisma Client المولَّد (ما يُرفع لـ git)
src/prismaClient.js      اتصال Prisma بقاعدة البيانات عبر driver adapter
src/server.js            كل الـ routes والمنطق (Express خام، بدون طبقات إضافية)
```
