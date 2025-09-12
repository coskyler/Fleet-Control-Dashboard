import session from 'express-session';
import RedisStore from 'connect-redis';
import { createClient } from 'redis';

const redisClient = createClient({ url: 'redis://localhost:6379' });
redisClient.connect().catch(console.error);

const sessionMiddleware =  session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SIGNATURE,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 60000 } // 1 minute
});

export default sessionMiddleware;