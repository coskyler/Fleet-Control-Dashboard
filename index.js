const express = require('express');
const session = require('express-session');
const RedisStore = require('connect-redis').default;
const { createClient } = require('redis');
const pool = require('./db');

const app = express();
const PORT = 3000;

const redisClient = createClient({url: 'redis://localhost:6379'});
redisClient.connect().catch(console.error);

app.use(
  session({
    store: new RedisStore({ client: redisClient }),
    secret: process.env.SESSION_SIGNATURE,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 86400000 } // 1 day
  })
);

app.get('/', (req, res) => {
  res.send('Backend is running!');
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
