# 🛡️ Vyne

<p align="center">
  <strong>Privacy-first peer-to-peer video calls & instant messaging</strong><br>
  No account • No media storage • Temporary rooms • WebRTC encrypted transport
</p>

<p align="center">
  <a href="https://github.com/thedhanushkiran/vyne"><img src="https://img.shields.io/badge/WebRTC-P2P_Media-blue?style=for-the-badge&logo=webrtc" alt="WebRTC"></a>
  <a href="https://nodejs.org"><img src="https://img.shields.io/badge/Node.js-Signaling_Backend-339933?style=for-the-badge&logo=nodedotjs" alt="Node.js"></a>
  <a href="https://github.com/thedhanushkiran/vyne/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="MIT License"></a>
</p>

---

## What is Vyne?

**Vyne** is a lightweight, browser-based communication app built around **WebRTC**.

Two people can create or join a temporary room and communicate using:

- 🎥 Camera video
- 🎙️ Microphone audio
- 🖥️ Screen sharing
- 💬 Peer-to-peer text chat
- 📊 Connection and data-usage indicators
- 🛡️ Privacy Shield

Vyne does **not** require user accounts or a traditional application database. The signaling server coordinates the WebRTC handshake; the actual call media is designed to travel directly between peers whenever the network permits.

### Design philosophy

> **The server should help peers find each other, not become the place where their conversation lives.**

---

## ✨ Features

### 🔐 Privacy & security

- **Temporary two-person rooms** — each room is limited to two participants.
- **URL hash room IDs** — the room ID is placed after `#`, so it is not included in the normal HTTP request path.
- **WebRTC encrypted transport** — WebRTC uses DTLS-SRTP for media transport and the RTCDataChannel is protected by WebRTC's security model.
- **No application-level media storage** — the Vyne server does not receive or store the camera/microphone media stream.
- **No account system** — no username/password database is required.
- **No persistent chat database** — chat messages are exchanged over the RTCDataChannel.
- **Privacy-focused response headers** — the signaling/static server sends restrictive browser security headers.
- **Privacy Shield** — hides the call interface when the page is backgrounded or loses focus where the browser exposes that state.
- **Capture awareness** — Vyne clearly indicates when its own screen-sharing session is active and notifies the peer when screen sharing is started/stopped.

### 🎥 Communication

- WebRTC video/audio calls
- Audio-only mode
- Camera and microphone controls
- Screen sharing with camera track replacement
- Automatic return from screen share to camera
- Peer connection state monitoring
- ICE candidate exchange
- WebSocket signaling
- Automatic room cleanup when a peer disconnects

### 💬 P2P chat

- RTCDataChannel-based messaging
- No server-side chat history
- Unread-message indicator
- Responsive chat drawer
- Message timestamps

### 📶 Bandwidth controls

| Preset | Resolution | FPS | Target video bitrate |
|---|---:|---:|---:|
| Audio | — | — | Audio only |
| Low | 320×240 | 12 | ~150 kbps |
| Medium | 480×360 | 20 | ~350 kbps |
| High | 640×480 | 25 | ~700 kbps |

Actual bandwidth depends on the browser, codec, network conditions, audio bitrate, and WebRTC congestion control.

### 🛡️ Privacy Shield

The Privacy Shield is designed as a **browser-level privacy mitigation**, not a promise of impossible screenshot prevention.

When enabled, Vyne can temporarily hide the call UI when the browser page becomes hidden or loses focus. This helps reduce accidental exposure when switching applications or tabs.

**Important limitation:** a normal web application cannot reliably detect or prevent every operating-system screenshot, camera pointed at the display, browser extension capture, or external screen recorder. Vyne therefore treats this as **privacy deterrence and mitigation**, not guaranteed anti-screenshot protection.

---

## 🧠 Architecture

```text
                         ┌──────────────────────┐
                         │   Vyne Signaling     │
                         │   Node.js + WebSocket│
                         └──────────┬───────────┘
                                    │
                         SDP / ICE / room events
                                    │
                ┌───────────────────┴───────────────────┐
                │                                       │
         ┌──────▼──────┐                         ┌──────▼──────┐
         │  Browser A  │                         │  Browser B  │
         │    Vyne     │                         │    Vyne     │
         └──────┬──────┘                         └──────┬──────┘
                │                                       │
                └────────────── WebRTC P2P ─────────────┘
                         Audio / Video / Chat
```

### Signaling server

The Node.js server is responsible for:

1. Accepting WebSocket connections.
2. Creating temporary room membership.
3. Limiting rooms to two participants.
4. Relaying:
   - SDP offers
   - SDP answers
   - ICE candidates
   - media-state events
   - screen-share-state events
   - leave events
5. Removing the room when the session ends.
6. Serving the frontend and `/health`.

### Peer-to-peer layer

After signaling, the browser creates an `RTCPeerConnection`.

```text
Browser A
   │
   ├── Camera / microphone
   ├── Screen capture
   └── RTCDataChannel
          │
          │ WebRTC
          ▼
Browser B
```

The signaling server is **not the media server**.

---

## 🛡️ Security model

Vyne uses several layers:

```text
┌───────────────────────────────────────────────┐
│                 Vyne Security                 │
├───────────────────────────────────────────────┤
│ Browser permissions                           │
│        ↓                                      │
│ WebRTC DTLS-SRTP media transport              │
│        ↓                                      │
│ RTCDataChannel for peer chat                  │
│        ↓                                      │
│ Temporary room membership                     │
│        ↓                                      │
│ Privacy-focused server headers                │
│        ↓                                      │
│ Privacy Shield / capture awareness            │
└───────────────────────────────────────────────┘
```

### What Vyne does not claim

Vyne should **not** be described as:

- guaranteed screenshot-proof
- guaranteed screen-recording-proof
- anonymous at the network level
- immune to malicious browser extensions
- immune to endpoint compromise
- a replacement for a professionally audited secure messenger

WebRTC encryption protects the network transport, but the two endpoints still control the decrypted media.

---

## 🚨 Screenshot & screen-recording protection

### What is implemented

- Privacy Shield UI
- Background/visibility mitigation
- Focus-loss mitigation
- Screen-sharing state notifications
- Local screen-share status indicator
- Clear privacy messaging

### What browsers cannot guarantee

Web applications generally cannot obtain a universal OS-level event saying:

> "The user just pressed the screenshot key."

Likewise, a webpage cannot reliably stop a user from recording the display with:

- Windows/macOS screen capture
- another device
- browser-level capture tools
- accessibility tools
- malicious extensions
- virtual machines or remote-desktop software

Therefore the Vyne UI intentionally uses the wording **Privacy Shield**, **capture awareness**, and **privacy mitigation** rather than claiming absolute protection.

---

## 🎨 UI / Design System

Vyne uses a dark, privacy-oriented interface with:

- Glassmorphism panels
- High-contrast controls
- Responsive layouts
- Rounded call controls
- Minimal visual noise
- Status pills for connection state
- Privacy status indicator
- Dedicated Privacy Shield overlay
- Mobile-friendly chat drawer

### Design priorities

1. **Privacy should be visible**
2. **Call controls should be immediately understandable**
3. **Warnings should be noticeable without being disruptive**
4. **The interface should work on mobile and desktop**
5. **Security claims should be technically honest**

---

## 🗂️ Project structure

```text
vyne/
├── index.html
│   ├── UI
│   ├── CSS design system
│   ├── WebRTC client
│   ├── RTCDataChannel chat
│   ├── Screen sharing
│   ├── Privacy Shield
│   ├── Connection metrics
│   └── Call controls
│
├── server.js
│   ├── HTTP static server
│   ├── WebSocket signaling
│   ├── Room management
│   ├── Heartbeat handling
│   └── Health endpoint
│
├── inject-config.js
│   └── Deployment-time signaling URL injection
│
├── netlify.toml
│   └── Netlify configuration
│
├── package.json
├── package-lock.json
├── README.md
└── .gitignore
```

> `node_modules/` should not be committed to Git. Run `npm install` after cloning.

---

## 🚀 Run locally

### Requirements

- Node.js 18+
- A modern browser with WebRTC support
- Camera/microphone for video calls

### Install

```bash
git clone https://github.com/thedhanushkiran/vyne.git
cd vyne
npm install
```

### Start

```bash
npm start
```

Open:

```text
http://localhost:8080
```

Health check:

```text
http://localhost:8080/health
```

### Test with two peers

Open the application in:

- two browser windows, or
- a normal window + private/incognito window

Create a call in one window and open the generated room link in the second.

For real device-to-device testing, use an HTTPS deployment because browser media permissions and WebRTC behavior are more restrictive on insecure origins.

---

## 🌍 Deployment

### Node.js host

Vyne can run on a Node.js service such as a VPS or a platform that supports long-lived WebSocket connections.

Typical configuration:

```text
Install: npm install
Start:   npm start
Port:    process.env.PORT
```

The server already uses the platform-provided `PORT` when available.

### Separate frontend + signaling server

The frontend can be deployed separately from the signaling backend.

Set:

```env
VYNE_SIGNAL_URL=wss://your-signaling-domain.example
```

`inject-config.js` inserts this value into the built frontend.

### HTTPS / WSS

Production should use:

```text
https://your-vyne-domain.example
wss://your-signaling-domain.example
```

Avoid exposing an unencrypted `ws://` signaling endpoint from a production HTTPS site.

---

## 🔧 Environment configuration

### `VYNE_SIGNAL_URL`

Controls which WebSocket signaling endpoint the frontend connects to.

Example:

```env
VYNE_SIGNAL_URL=wss://signal.example.com
```

Local development automatically falls back to:

```text
ws://localhost:8080
```

---

## ❤️ Health endpoint

The server exposes:

```text
GET /health
```

Example response:

```json
{
  "status": "ok",
  "rooms": 0,
  "timestamp": "2026-08-11T00:00:00.000Z"
}
```

This is intended for uptime checks and deployment monitoring.

---

## 🧪 Feature status

| Feature | Status |
|---|---|
| WebRTC audio/video | ✅ |
| P2P media transport | ✅ |
| P2P text chat | ✅ |
| Temporary 2-person rooms | ✅ |
| Screen sharing | ✅ |
| Audio-only mode | ✅ |
| Quality presets | ✅ |
| Connection health | ✅ |
| Data-usage estimate | ✅ |
| Privacy Shield | ✅ |
| Screen-share awareness | ✅ |
| No application media storage | ✅ |
| Accounts | ❌ Not required |
| Persistent chat history | ❌ |
| Group calls | 🚧 Planned |
| P2P file transfer | 🚧 Planned |
| TURN server support | 🚧 Planned |
| Formal security audit | ❌ Not yet |

---

## 🗺️ Roadmap

### Phase 1 — Privacy foundation
- [x] WebRTC P2P calls
- [x] P2P chat
- [x] Temporary rooms
- [x] Screen sharing
- [x] Privacy Shield
- [x] Screen-share awareness
- [x] Security/privacy headers

### Phase 2 — Advanced privacy
- [ ] Stronger capture-awareness UX where browser APIs permit
- [ ] Optional watermark/session identity overlay
- [ ] Privacy mode presets
- [ ] Clearer endpoint-security warnings
- [ ] Configurable room expiration
- [ ] Optional self-destructing session metadata

### Phase 3 — Networking
- [ ] Custom TURN server
- [ ] Better NAT traversal diagnostics
- [ ] Connection quality history
- [ ] Automatic network recovery

### Phase 4 — Communication
- [ ] P2P file transfer
- [ ] Emoji/reaction support
- [ ] Message delivery state
- [ ] Voice-only optimized UI
- [ ] Group calls using an SFU architecture

### Phase 5 — Security engineering
- [ ] Threat model documentation
- [ ] Automated security testing
- [ ] Dependency auditing
- [ ] CSP hardening
- [ ] Formal third-party security review

---

## ⚠️ Privacy & security notes

Vyne is a portfolio/learning project and should be treated accordingly.

### Metadata still exists

Even when the application does not persist call data, normal networking infrastructure may expose metadata such as:

- IP addresses
- connection timing
- network-level traffic information
- WebRTC ICE candidates

A privacy-focused architecture does **not** automatically make users anonymous.

### Endpoint security matters

If an endpoint is compromised, encryption cannot protect what is already visible inside the user's browser.

Always keep the operating system, browser, extensions, and device secure.

---

## 🤝 Contributing

Create a feature branch:

```bash
git checkout -b feature/your-feature
```

Make your changes, then:

```bash
git add .
git commit -m "Add your feature"
git push origin feature/your-feature
```

Open a pull request.

---

## 📜 License

MIT License.

See `LICENSE` for the complete license text.

---

<p align="center">
  Built with ❤️ and WebRTC
  <br>
  <strong>Vyne</strong> — private communication, without unnecessary infrastructure.
  <br><br>
  by <a href="https://github.com/thedhanushkiran">Dhanush Kiran</a>
</p>
