import Redis from 'ioredis';

export const redis = new Redis(process.env.REDIS_URL || {
  port: process.env.REDIS_PORT && Number(process.env.REDIS_HOST),
  host: process.env.REDIS_HOST,
  family: process.env.REDIS_FAMILY,
  path: process.env.REDIS_PATH,
  db: process.env.REDIS_DB,
  password: process.env.REDIS_PASSWORD,
  username: process.env.REDIS_USERNAME,
});

export default redis;