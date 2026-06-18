# Vyne

**Encrypted peer-to-peer video calls. No account. No recording. No tracking.**

Vyne is a minimal WebRTC video calling app. Two people share a link and connect directly — media never touches a server. The signaling server only handles the ~2 second WebRTC handshake, then goes idle.

---

## Features

- 🔒 End-to-end encrypted via WebRTC DTLS-SRTP
- 📱 Mobile-first, works on all modern browsers
- 🔗 No account — share a link to start a call
- 📶 Quality presets tuned for low bandwidth (Audio / 240p / 360p / 480p)
- 🚫 No ads, no tracking, no recording

---

## Stack

| Layer | Tech |
|-------|------|
| Frontend | Vanilla HTML/CSS/JS (single file) |
| Signaling | Node.js + WebSocket (`ws`) |
| P2P | WebRTC (browser-native) |
| Frontend hosting | Netlify |
| Signaling hosting | Render |

---

## Local Development

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/vyne.git
cd vyne
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the signaling server

```bash
npm start
```

Server runs on `http://localhost:8080`. Health check: `http://localhost:8080/health`

### 4. Open the frontend

Open `index.html` directly in your browser — or serve it with any static server:

```bash
npx serve .
```

---

## Deployment

### Signaling Server → Render

1. Go to [render.com](https://render.com) and create a new **Web Service**
2. Connect your GitHub repo
3. Set:
   - **Build command:** `npm install`
   - **Start command:** `npm start`
   - **Environment:** Node
4. Deploy — copy the `wss://your-app.onrender.com` URL

### Frontend → Netlify

1. Go to [netlify.com](https://netlify.com) and create a new site from your GitHub repo
2. Set environment variable in Netlify dashboard:
   - Key: `VYNE_SIGNAL_URL`
   - Value: `wss://your-render-app.onrender.com`
3. Deploy

---

## Privacy

- Room IDs are in the URL `#hash` — never sent to any server in HTTP logs
- Media is peer-to-peer — the signaling server never sees audio or video
- No cookies, no analytics, no accounts

---

## License

MIT — free to use, fork, and self-host.
