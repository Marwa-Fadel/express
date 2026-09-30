// Prisma 7: ممنوع تحطي url جوا schema.prisma - لازم تكون هون بس
import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: env('DATABASE_URL'),
  },
});
