const express = require('express');
const session = require('express-session');
const RedisStore = require('connect-redis').default;
const { createClient } = require('redis');
const pool = require('./db');

const app = express();
const PORT = 3000;

const redisClient = createClient({url: 'redis://localhost:6379'});
redisClient.connect().catch(console.error);

const http = require('http');
const { WebSocketServer } = require('ws');

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const unityClients = new Map();
const browserClients = new Map();

app.use(express.json());

const sessionMiddleware =  session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SIGNATURE,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 60000 } // 1 minute
})

app.use(sessionMiddleware);

server.on('upgrade', (req, socket, head) => {
  if(req.url.includes('/unity')) {
    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit('connection', ws, req);
    })
    return;
  }

  sessionMiddleware(req, {}, () => {
    if(!req.session) {
      socket.destroy();
      return;
    }

    wss.handleUpgrade(req, socket, head, (ws) => {
      ws.session = req.session;
      wss.emit('connection', ws, req);
    })
  })
})

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
    const result = await pool.query('INSERT INTO users (username, password) VALUES ($1, $2)', [username, password]);
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

app.get('/', (req, res) => {
  res.send('Backend is running!');
});

wss.on('connection', (ws, req) => {
  //browser websocket
  if (req.session) {

    ws.on('message', (msg) => {
      let data;
      try {
        data = JSON.parse(msg);
      } catch (e) {
        ws.close(1003, 'Invalid JSON');
        return;
      }

      switch (data.type) {
        case 'init-browser': {
          const { unitySessionId } = data;

          ws.sessionID = req.session.id;
          ws.sessionType = 'browser';

          if( !unityClients.has(unitySessionId) ) {
            ws.send(JSON.stringify({type: 'session-created', success: false}));
            ws.close(4001, 'Unity session not found');
            return;
          }
          
          const unityWs = unityClients.get(unitySessionId);

          if(unityWs.browserSessionId) {
            ws.send(JSON.stringify({type: 'session-created', success: false}));
            ws.close(4002, 'Unity session already linked');
            return;
          }
          
          unityWs.browserSessionId = ws.sessionID;

          const scanData = {
            unitySessionId,
            scanStart: null,
            voxelMap: [],
            drones: [],
            status: 'active'
          }

          req.session.scanData = scanData;

          req.session.save(err => {
            if (err) console.error('WebSocket session save failed:', err);
          });

          browserClients.set(ws.sessionID, ws);
        }
      }
    })

  //unity websocket
  } else {
    ws.on('message', (msg) => {
      let data;
      try {
        data = JSON.parse(msg);
      } catch (e) {
        ws.close(1003, 'Invalid JSON');
        return;
      }

      switch (data.type) {
        case 'init-unity': {
          //generate session id
          let unitySessionId;
          do {
            unitySessionId = generateUnitySessionId();
          } while(unityClients.has(unitySessionId));

          ws.sessionID = unitySessionId;
          ws.sessionType = 'unity';

          unityClients.set(unitySessionId, ws);
          ws.send(JSON.stringify({type: 'session-created', sessionID: unitySessionId, success: true}));
        }
      }
    })
  }

  ws.on('close', () => {
    if (ws.sessionType == 'browser') {
      browserClients.delete(ws.sessionID);
    } else if (ws.sessionType == 'unity') {
      unityClients.delete(ws.sessionID);
    }
  })
})

server.listen(PORT, () => {
  console.log(`HTTP and WS Server listening on http://localhost:${PORT}`);
});

function generateUnitySessionId(length = 5) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < length; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}