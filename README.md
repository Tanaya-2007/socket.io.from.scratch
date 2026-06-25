# Socket.IO From Scratch

A structured, hands-on learning journey through Socket.IO — from your very first connection to production-ready scaling with Redis.

🚀 **Live Deployed App:** [https://socket-io-4uth.onrender.com](https://socket-io-4uth.onrender.com)

---

## About This Repo

This repository is a step-by-step breakdown of Socket.IO concepts, built from absolute zero. It is split into a **React Frontend Client** and a **Node.js Express Backend Server** featuring a 12-level progressive curriculum.

Whether you're a beginner trying to understand WebSockets or someone looking to refresh your knowledge before building a production app, this repo has you covered.

---

## Learning Path

| Level | Module | Description |
|---|--------|-------------|
| 01 | **Basic Connection** | Set up your first Socket.IO server and client, understand the handshake and connection lifecycle |
| 02 | **Rooms** | Organize sockets into rooms — join, leave, and emit to specific groups |
| 03 | **Broadcasting** | Broadcast messages to all connected clients or everyone except the sender |
| 04 | **Namespaces** | Create isolated communication channels within a single server |
| 05 | **Acknowledgements & Callbacks** | Confirm message delivery with callbacks and implement server-side acknowledgements |
| 06 | **Error Handling** | Handle disconnections, connection errors, and configure auto-cleanup |
| 07 | **Middleware** | Intercept connections to run auth checks, validation, or logging before accepting/rejecting |
| 08 | **Custom Event Handling** | Design and manage your own event-driven architecture with custom event namespaces |
| 09 | **Volatile Events & Binary Data** | Send fire-and-forget messages and transmit binary payloads |
| 10 | **Database Integration** | Persist real-time events and chat histories to MongoDB |
| 11 | **Rate Limiting & Security** | Protect your server from spam using local and distributed rate limiters |
| 12 | **Redis Adapter & Scaling** | Scale Socket.IO across multiple servers horizontally using a Redis Pub/Sub adapter |

---

## Tech Stack
- **Frontend** — React.js + Tailwind CSS
- **Runtime** — Node.js
- **Framework** — Express.js
- **Real-time** — Socket.IO
- **Database** — MongoDB (with Mongoose models)
- **Cache / PubSub Broker** — Redis (via `@socket.io/redis-adapter`)

---

## Production-Grade Architecture Features
To ensure the project reaches a 10/10 production level, the following custom features are implemented:
* **Centralized Mongoose Models**: User and Message schemas are extracted into dedicated files to ensure DRY (Don't Repeat Yourself) database configurations.
* **Persistent Sessions (MongooseStore)**: Designed a custom, zero-dependency Express Session store that saves handshakes in MongoDB with automatic TTL (Time-to-Live) expiration cleanup.
* **Hybrid Distributed Rate Limiter**: Built a rate-limiting system that dynamically uses **Redis Sorted Sets (`ZADD`/`ZCARD`)** in production (for multi-server scaling) and falls back to standard in-memory arrays during local development.

---

## Getting Started

### Prerequisites

Make sure you have the following installed on your machine:
- Node.js (v18 or above)
- MongoDB (local or Atlas)
- Redis (optional, required for Level 12 scaling)

### Environment Setup

Create a `.env` file in the `server` directory:

```env
PORT=4000
MONGODB_URI=mongodb://localhost:27017/socketio-course
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_super_secret_jwt_key
SESSION_SECRET=your_super_secret_session_key
CLIENT_URL=http://localhost:3000
SERVER_URL=http://localhost:4000
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

Create a `.env` file in the `client` directory:

```env
REACT_APP_API_URL=http://localhost:4000
```

### Installation & Run

1. **Start the Backend Server**:
   ```bash
   cd server
   npm install
   npm start
   ```

2. **Start the Frontend Client**:
   ```bash
   cd client
   npm install
   npm start
   ```

Open [http://localhost:3000](http://localhost:3000) to view the course platform locally!

---

## Folder Structure

```
├── client/          # React SPA Frontend
│   ├── public/      # Static public assets (index.html, favicon.png)
│   └── src/         # React Components, Contexts, and Levels 1-12
└── server/          # Node.js Express Backend
    ├── lib/         # Custom modules (MongooseStore.js)
    ├── models/      # Mongoose DB Schemas (User.js, Message.js)
    ├── auth.js      # Credentials Authentication Router
    ├── oauth.js     # Passport OAuth Router (Google/GitHub Strategies)
    └── index.js     # Main Socket.IO Server & Event Hooks
```

---

## Contributing

Contributions are welcome! Feel free to open a Pull Request.

1. Fork the repo
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

Built with love by Tanaya ❤️ while learning real-time communication!