import session from 'express-session';
import RedisStore from 'connect-redis';
import redisClient from '../infra/redis.js';

const sessionMiddleware =  session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SIGNATURE,
  resave: false,
  saveUninitialized: true,
  rolling: true,
  cookie: { secure: false, maxAge: 60000 } // 1 minute
});

export default sessionMiddleware;