import Redis from 'ioredis';

// Docker Redis configuration
const redisClient = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  // Uncomment if you set a password in redis.conf
  // password: process.env.REDIS_PASSWORD
});

// Error handling
redisClient.on('error', (err) => {
  console.error('Redis Client Error', err);
});

export default redisClient;
