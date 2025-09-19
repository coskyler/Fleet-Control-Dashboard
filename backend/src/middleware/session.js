import session from 'express-session';
import RedisStore from 'connect-redis';
import redisClient from '../infra/redis.js';

const sessionMiddleware =  session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SIGNATURE,
  resave: false,
  saveUninitialized: true,
  rolling: true,
  cookie: { secure: true, sameSite: "none", maxAge: 600000 } // 10 minutes
});

const cors = (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:5173");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
}

export { sessionMiddleware, cors };