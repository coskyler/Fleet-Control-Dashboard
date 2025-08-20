# Fleet Control Dashboard

A web app for managing scans from autonomous fleets (e.g. drones).
Users can log in, connect scan devices (via Unity), and manage stored scan data.
The system maintains **two WebSocket connections** for real-time interaction between the Unity client and the dashboard.

🚧 **Status:** In development  

See [link text](https://github.com/coskyler/AIDN-Drone-Navigation)

## Features
- User authentication and session handling (Redis)
- Real-time Unity scan streaming (dual WebSockets)
- Persistent storage and management of scan data
- Backend: Node.js, Express.js, PostgreSQL, Redis
- Frontend: React, Three.js
