# Synapse Client 🧠

**Synapse Client** is a premium, highly-responsive enterprise chat application frontend built with **Next.js 14+ (App Router)** and **Tailwind CSS**. It seamlessly interfaces with a scalable Spring Boot backend leveraging robust JWT Authentication and Real-time WebSocket Messaging (STOMP/SockJS).

This application mimics the fast and fluid 3-pane structure seen in popular tools like Discord and Slack.

---

## ⚡ Architecture & Tech Stack
* **Framework**: React / Next.js (App Router, strict mode).
* **Styling**: Tailwind CSS utilizing heavy `glassmorphism`, `framer-motion` micro-animations, and dynamic gradient UI states.
* **State Management**: Fully reliant on globally fast, un-opinionated `Zustand` states.
* **Communication Lifecycle**: 
  * `Axios`: Base instance pre-configured to automatically inject `Authorization: Bearer <jwt-token>` on secure endpoints.
  * `@stomp/stompjs` + `sockjs-client`: A powerful Singleton class architecture resolving room connection states over WebSockets securely using the same JWT token.

---

## 🚀 Features Implemented
* **Authentication**: Seamless Registration and Login forms handling JWT `storage` gracefully.
* **Real-time Messaging**: STOMP integrations rendering message payloads directly fetched from `/topic/chat/{roomId}`.
* **Typing Indicators**: High-performance debounced Socket listeners updating `/topic/presence/{roomId}` dynamically as users type. Auto-scrolls components automatically downwards ensuring ease of viewing.
* **Dynamic Room Switching**: Creates active channels `POST /api/v1/rooms { name: "...", type: "PUBLIC" }` switching contexts effortlessly without jarring re-loads.
* **Advanced Error Handling**: Complete `try/catch` UI wrapping avoiding nasty SSR boundary breaks natively in Next.js

---

## ⚙️ How to Build & Run Locally
### Method 1: Bare Metal (Node.js)

1. Ensure **Node.js (v20+)** and `npm` are installed.
2. Install the necessary system dependencies:
   ```bash
   npm install
   ```
3. Boot up the development instance:
   ```bash
   npm run dev
   ```
   > The application will open interactively at [http://localhost:3000](http://localhost:3000)
4. *(Optional)* To verify a production output manually:
   ```bash
   npm run build
   npm start
   ```

### Method 2: Containerization (Docker)
The Next.js application leverages an optimized multi-stage build. This compresses the application context dramatically into a standalone Node package runtime.

1. Ensure Docker Desktop / Engine is actively running on your local machine.
2. Build the image:
   ```bash
   docker build -t synapse-client .
   ```
3. Run the image inside an optimized container:
   ```bash
   docker run -p 3000:3000 synapse-client
   ```
   > Simply visit [http://localhost:3000](http://localhost:3000). 

---

## 🤝 Connectivity Notes
The frontend natively connects to local paths out of the box. 

* **REST API Calls:** Dispatched directly to `http://localhost:8080/api/v1/...`
* **WebSocket Streams:** Opened persistently on `ws://localhost:8080/ws`

If you deploy your backend to an alternative URL, please verify these base URLs in the frontend's networking layers (`services/api.ts` and `services/websocket.ts`).
