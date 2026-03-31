# Socket.IO From Scratch

A structured, hands-on learning journey through Socket.IO — from your very first connection to production-ready scaling with Redis.

---

## About This Repo

This repository is a step-by-step breakdown of Socket.IO concepts, built from absolute zero. Each folder is a self-contained module that covers one concept at a time — no fluff, just real code and real-time communication.

Whether you're a beginner trying to understand WebSockets or someone looking to refresh your knowledge before building a production app, this repo has you covered.

---

## Learning Path

| # | Module | Description |
|---|--------|-------------|
| 01 | **Basic Connection** | Set up your first Socket.IO server and client, understand the handshake and connection lifecycle |
| 02 | **Rooms** | Organize sockets into rooms — join, leave, and emit to specific groups |
| 03 | **Broadcasting** | Broadcast messages to all connected clients or everyone except the sender |
| 04 | **Namespaces** | Create isolated communication channels within a single server |
| 05 | **Acknowledgements & Callbacks** | Confirm message delivery with callbacks and implement server-side timers |
| 06 | **Error Handling** | Handle disconnections, connection errors, and configure auto-reconnect strategies |
| 07 | **Middleware** | Intercept connections to run auth checks, validation, or logging before accepting/rejecting |
| 08 | **Custom Event Handling** | Design and manage your own event-driven architecture with custom event names |
| 09 | **Volatile Events & Binary Data** | Send fire-and-forget messages and transmit binary payloads (Buffers, Blobs) |
| 10 | **Database Integration** | Persist real-time events and messages to MongoDB |
| 11 | **Rate Limiting & Security** | Protect your server from spam, abuse, and DDoS attacks |
| 12 | **Redis Adapter & Scaling** | Scale Socket.IO across multiple servers using the Redis adapter |

---

## Tech Stack
- **Frontend** - React.js + Tailwind CSS
- **Runtime** — Node.js
- **Framework** — Express.js
- **Real-time** — Socket.IO
- **Database** — MongoDB (with Mongoose)
<!-- - **Cache / Adapter** — Redis -->

---

## Getting Started

### Prerequisites

Make sure you have the following installed:

- Node.js (v18 or above)
- MongoDB (local or Atlas)
- Redis (required for module 12)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/socketio-from-scratch.git

# Navigate into the project
cd socketio-from-scratch

# Go to any module and install dependencies
cd 01-basic-connection
npm install

# Start the server
node index.js
```

> Each module has its own `package.json`. Navigate into the specific folder and run `npm install` before starting.

---

## Folder Structure

---

## Key Concepts Covered

- WebSocket protocol vs HTTP polling
- `emit`, `on`, `broadcast`, `to()`, `in()`
- Rooms vs Namespaces — when to use which
- Middleware for authentication (JWT / session-based)
- Acknowledgement patterns for reliable messaging
- Handling reconnections gracefully on the client
- Binary data transmission (images, files, audio chunks)
- Rate limiting with Socket.IO middleware
- Horizontal scaling with the Redis pub/sub adapter

---

## Contributing

Got a fix or want to add a module? Contributions are welcome!

1. Fork the repo
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request


---

Built with love by Tanaya❤️ while learning real-time communication!