# 🎥 Vyne

<p align="center">
  <strong>Encrypted peer-to-peer video calls.</strong><br>
  No account. No recording. No tracking.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/WebRTC-P2P-success" alt="WebRTC">
  <img src="https://img.shields.io/badge/Node.js-Backend-brightgreen" alt="Node.js">
  <img src="https://img.shields.io/badge/License-MIT-blue" alt="MIT">
  <img src="https://img.shields.io/badge/Privacy-First-black" alt="Privacy">
</p>

---

## 🚀 What is Vyne?

Vyne is a lightweight WebRTC-powered video calling platform that allows two people to connect instantly using a shared link.

No sign-up. No downloads. No tracking.

The signaling server only assists with the initial connection handshake. Once connected, audio and video streams travel directly between peers.

```text
Browser A  ◄────────────►  Browser B
            Direct P2P
```

---

## ✨ Features

- 🔒 End-to-end encrypted media
- ⚡ Instant call links
- 👤 No accounts required
- 📱 Mobile-friendly interface
- 🌐 Works in modern browsers
- 📶 Bandwidth optimized presets
  - Audio Only
  - 240p
  - 360p
  - 480p
- 🚫 No ads
- 🚫 No tracking
- 🚫 No analytics
- 🚫 No recordings

---

## 🏗 Architecture

```text
           WebRTC Offer / Answer
                    │
                    ▼

        ┌────────────────────┐
        │  Signaling Server  │
        │  Node.js + WS      │
        └────────────────────┘
                    ▲
                    │

After Connection

┌───────────────┐      P2P Media      ┌───────────────┐
│   Browser A   │ ◄────────────────► │   Browser B   │
└───────────────┘                     └───────────────┘
```

The signaling server never processes video or audio streams.

---

## 🛠 Tech Stack

| Layer | Technology |
|--------|------------|
| Frontend | HTML, CSS, JavaScript |
| Signaling | Node.js |
| Transport | WebSocket |
| Media | WebRTC |
| Frontend Hosting | Netlify |
| Backend Hosting | Render |

---

## 📂 Project Structure

```text
vyne/
│
├── public/
│   ├── index.html
│   ├── app.js
│   └── styles.css
│
├── server/
│   └── signaling.js
│
├── package.json
├── README.md
└── .gitignore
```

---

## 🚀 Local Development

### Clone Repository

```bash
git clone https://github.com/thedhanushkiran/vyne.git
cd vyne
```

### Install Dependencies

```bash
npm install
```

### Start Signaling Server

```bash
npm start
```

Server:

```text
http://localhost:8080
```

Health Check:

```text
http://localhost:8080/health
```

### Run Frontend

```bash
npx serve .
```

or simply open:

```text
index.html
```

---

## 🌍 Deployment

### Backend → Render

1. Create a new Web Service
2. Connect your GitHub repository
3. Configure:

```text
Build Command: npm install
Start Command: npm start
Runtime: Node.js
```

4. Deploy

WebSocket URL:

```text
wss://your-app.onrender.com
```

---

### Frontend → Netlify

Add Environment Variable:

```env
VYNE_SIGNAL_URL=wss://your-app.onrender.com
```

Deploy.

---

## 🔐 Privacy

### Room IDs

Room IDs are stored in URL fragments.

Example:

```text
https://vyne.app/#my-room
```

Hash fragments are never included in HTTP requests.

### Media

All media is transmitted peer-to-peer.

```text
User A ◄──────────► User B
```

The signaling server never receives video or audio.

### Data Collection

Vyne stores:

- No user accounts
- No analytics
- No cookies
- No recordings
- No personal information

---

## 🗺 Roadmap

- [ ] Screen Sharing
- [ ] Text Chat
- [ ] File Transfer
- [ ] Dark Mode
- [ ] Progressive Web App (PWA)
- [ ] TURN Server Fallback
- [ ] Multiple Languages
- [ ] Call Statistics

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
