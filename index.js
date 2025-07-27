const express = require('express');
const session = require('express-session');
const RedisStore = require('connect-redis').default;
const { createClient } = require('redis');
const pool = require('./db');

const app = express();
const PORT = 3000;

const redisClient = createClient({url: 'redis://localhost:6379'});
redisClient.connect().catch(console.error);

app.use(express.json());

app.use(
  session({
    store: new RedisStore({ client: redisClient }),
    secret: process.env.SESSION_SIGNATURE,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 60000 } // 1 minute
  })
);

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE username = $1 AND password = $2', [username, password]);
    if (result.rows.length === 1) {
      req.session.user = { id: result.rows[0].id, username};
      res.send('Logged into ' + username);
    } else {
      res.status(401).send("Invalid username or password");
    } 
  } catch(err) {
    console.log("Login error:", err);
    res.status(500).send('Server error');
  }
})

app.post('/logout', async (req, res) => {
  const unitySessionId = req.session.unitySessionId;
  if(unitySessionId) {
    try {
      await redisClient.del(`unity:${unitySessionId}`);
    } catch (err) {
      console.log('Logout session deletion error:', err);
      return res.send('Logout failed');
    }
  }

  req.session.destroy(err => {
    if (err) {
      console.log('Logout error:', err);
      return res.status(500).send('Logout failed');
    }

    res.clearCookie('connect.sid');
    res.send('Logged out');
  })
})

app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    await pool.query('INSERT INTO users (username, password) VALUES ($1, $2)', [username, password]);
    req.session.user = { id: result.rows[0].id, username };
    res.send('Account created');
  } catch (err) {
    if (err.code == '23505') {
      res.status(409).send('Username already exists');
    } else {
      console.log('Registration error:', err);
      res.status(500).send('Server error');
    }
  }
})

app.post('/connect-unity-session', async (req, res) => {
  const { unitySessionId } = req.body;

  try {
    const data = await redisClient.get(`unity:${unitySessionId}`);
    if(!data) return res.status(404).send('Session not found');

    const unitySession = JSON.parse(data);

    if(unitySession.webSessionId != null) return res.status(409).send('Unity session linked to different browser');

    req.session.unitySessionId = unitySessionId; //assign unitySessionId in browser cookie

    unitySession.webSessionId = req.sessionID;
    await redisClient.set(`unity:${unitySessionId}`, JSON.stringify(unitySession), { EX: 600 });

    res.send('Unity session linked');
  } catch (err) {
    console.log('Error linking unity session:', err);
    res.status(500).send('Server error');
  }
})

app.post('/create-unity-session', async (req, res) => {
  const { unitySessionId } = req.body;

  const sessionData = {
    unitySessionId,
    webSessionId: null,
    scanStart: null,
    voxelMap: [],
    drones: [],
    status: 'inactive'
  }

  try {
    await redisClient.set(`unity:${unitySessionId}`, JSON.stringify(sessionData), { EX: 600 });
    res.send('Session created');
  } catch (err) {
    console.log('Redis Unity session error:', err);
    res.status(500).send('Error creating session');
  }
})

app.get('/', (req, res) => {
  res.send('Backend is running!');
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
