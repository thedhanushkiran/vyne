# 🎥 Vyne

<p align="center">
  <strong>Encrypted Peer-to-Peer Video Calls & Instant Messaging</strong><br>
  No Sign-up • No Data Logging • Zero Server-side Media Storage
</p>

<p align="center">
  <a href="https://github.com/thedhanushkiran/vyne"><img src="https://img.shields.io/badge/WebRTC-P2P_Media-blue?style=for-the-badge&logo=webrtc" alt="WebRTC"></a>
  <a href="https://nodejs.org"><img src="https://img.shields.io/badge/Node.js-Signaling_Backend-339933?style=for-the-badge&logo=nodedotjs" alt="Node.js"></a>
  <a href="https://github.com/thedhanushkiran/vyne/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="MIT License"></a>
  <img src="https://img.shields.io/badge/Privacy-Zero_Tracking-black?style=for-the-badge" alt="Privacy First">
</p>

---

## ⚡ Overview

**Vyne** is an end-to-end encrypted, lightweight WebRTC video calling and instant messaging platform designed for instant, high-privacy peer-to-peer communication. 

Users connect instantly by sharing a unique room link. Audio, video, screen share, and text chat streams flow **directly peer-to-peer (P2P)** between browser clients. The Node.js signaling server only facilitates the initial SDP offer/answer and ICE candidate exchange before idling.

```text
                     Initial Handshake (SDP/ICE)
                            ┌───────────┐
                            │ Signaling │
                            │  Server   │
                            └─────┬─────┘
                                  │
         ┌────────────────────────┴────────────────────────┐
         │                                                 │
         ▼                                                 ▼
  ┌──────────────┐          Direct P2P Media         ┌──────────────┐
  │  Browser A   │ ◄───────────────────────────────► │  Browser B   │
  └──────────────┘   Encrypted Audio/Video/Chat/Data  └──────────────┘
```

---

## ✨ Key Features

- 🔒 **End-to-End Encrypted Media**: Secured via DTLS-SRTP WebRTC protocols directly between peers.
- 💬 **Encrypted P2P Text Chat**: Integrated real-time messaging via WebRTC `RTCDataChannel` (zero server relaying).
- 🖥️ **Screen Sharing**: One-click display media sharing (`getDisplayMedia()`) with seamless camera track swap.
- 📶 **Bandwidth-Optimized Presets**:
  - **Audio Only**: ~24 kbps (~9 MB/hour)
  - **240p Low**: ~150 kbps (~68 MB/hour)
  - **360p Medium**: ~350 kbps (~157 MB/hour)
  - **480p High**: ~700 kbps (~315 MB/hour)
- 📊 **Real-time Metrics**: Integrated call timer, live estimated data consumption meter, and status badges.
- 👤 **Zero Friction**: No accounts, passwords, downloads, or sign-ups required.
- 🛡️ **Privacy Architecture**: Room IDs are kept in URL hash fragments (`#roomId=...`), preventing room tokens from appearing in server access logs.
- 🎨 **Modern Responsive UI**: Dark glassmorphic interface built with Vanilla CSS and responsive controls for desktop, tablet, and mobile browsers.

---

## 🛠 Tech Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | HTML5, CSS3, JavaScript (ES2024) | Modern, dependency-free client application |
| **Backend & Signaling** | Node.js, `ws` (WebSocket) | Lightweight HTTP static file server + WebRTC signaling relay |
| **Peer Connection** | WebRTC (`RTCPeerConnection`, `RTCDataChannel`) | Direct audio, video, screen share, and text data transport |
| **NAT Traversal** | Google Public STUN | Standard ICE candidate gathering for P2P connection setup |

---

## 📁 Project Structure

```text
vyne/
├── index.html        # Single-page client UI, WebRTC engine & P2P chat
├── server.js          # Combined HTTP static server & WebSocket signaling backend
├── inject-config.js   # Build-time environment variable injection utility
├── netlify.toml       # Deployment configuration for Netlify
├── package.json       # Project dependencies & scripts
├── README.md          # Repository documentation
└── .gitignore         # Git ignore policies
```

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
Ensure you have **Node.js (>= 18)** installed on your machine.

### 2. Installation
Clone the repository and install dependencies:

```bash
git clone https://github.com/thedhanushkiran/vyne.git
cd vyne
npm install
```

### 3. Start the Server
Launch the unified HTTP & WebSocket server:

```bash
npm start
```

### 4. Access Vyne
Open your browser and navigate to:
- **Application**: [http://localhost:8080](http://localhost:8080)
- **Health Check**: [http://localhost:8080/health](http://localhost:8080/health)

> **Testing Multi-Peer Calls**: Open `http://localhost:8080` in two separate browser windows (or incognito windows) to test call creation, link joining, media streaming, screen sharing, and P2P chat.

---

## 🌍 Deployment Guide

### Deployment Option A: Monolithic Node.js Hosting (Render, Railway, VPS)
Deploy `server.js` directly to any Node.js host.

1. **Build Command**: `npm install`
2. **Start Command**: `npm start`
3. **Environment Variable**: `PORT=8080` (or host provided port)

### Deployment Option B: Decoupled Netlify + Signaling Backend

1. **Backend**: Deploy `server.js` to Render/Railway to get your WebSocket signaling URL (`wss://your-backend.onrender.com`).
2. **Frontend (Netlify)**:
   - Connect the repository to Netlify.
   - Set environment variable:
     ```env
     VYNE_SIGNAL_URL=wss://your-backend.onrender.com
     ```
   - Netlify automatically executes `node inject-config.js` during build (configured in `netlify.toml`).

---

## 🔐 Security & Privacy Architecture

- **Zero Logs**: The signaling server processes temporary JSON handshake payloads (`offer`, `answer`, `ice-candidate`). It does **not** log or store IP mapping or session content.
- **URL Hash Fragments**: Room IDs are specified in the hash portion of the URL (e.g. `https://vyne.app/#roomId=abc123`). Browsers never transmit hash fragments in HTTP requests.
- **Direct Encryption**: Media and data streams are encrypted end-to-end using standard WebRTC DTLS (Datagram Transport Layer Security) and SRTP (Secure Real-time Transport Protocol).

---

## 🗺 Roadmap

- [x] WebRTC End-to-End Encrypted Video/Audio
- [x] P2P Encrypted Text Chat (`RTCDataChannel`)
- [x] Screen Sharing (`getDisplayMedia()`)
- [x] Dynamic Bitrate & Resolution Presets
- [x] Health Check & Static Server Integration
- [ ] Multi-party Group Calls (SFU Mesh Network)
- [ ] P2P File Transfer over DataChannels
- [ ] Custom TURN Server Integration for Strict Symmetric NATs

---

## 🤝 Contributing

```bash
git checkout -b feature/amazing-feature
git commit -m "Add amazing feature"
git push origin feature/amazing-feature
```

Open a Pull Request.

---

## 📜 License

Licensed under the MIT License.

---

<p align="center">
Built with ❤️ using WebRTC
<br>
by <a href="https://github.com/thedhanushkiran">Dhanush Kiran</a>
</p>
