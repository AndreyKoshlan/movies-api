import { RedisModuleOptions } from "@liaoliaots/nestjs-redis/dist/redis/interfaces";
import { RedisClientOptions } from "@liaoliaots/nestjs-redis/dist/redis/interfaces/redis-module-options.interface";

const DEFAULT_REDIS_OPTIONS = <RedisClientOptions>{
  host: process.env.REDIS_HOST || 'redis',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || 'redis',
}

const AUTH_REDIS_NAMESPACE = 'auth';
const REDIS_AUTH_OPTIONS = <RedisModuleOptions>{
    config: <RedisClientOptions>{
      namespace: AUTH_REDIS_NAMESPACE,
      ...DEFAULT_REDIS_OPTIONS
    },
}

export const redisConfig = {
  AUTH_REDIS_NAMESPACE,
  REDIS_AUTH_OPTIONS
}