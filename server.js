/**
 * Signaling Server & Static File Server for Vyne WebRTC Video Calls
 * ------------------------------------------------------------------
 * Responsibilities:
 *  - Serve static frontend files (index.html, etc.) and /health check endpoint
 *  - Assign clients to named "rooms" (room ID comes from URL hash)
 *  - Relay offer/answer/ICE/chat/media messages between exactly two peers in a room
 *  - Clean up rooms when peers disconnect or time out
 */

const http = require("http");
const fs = require("fs");
const path = require("path");
const { WebSocketServer } = require("ws");

const PORT = process.env.PORT || 8080;

// rooms: Map<roomId, [ws0, ws1]>
const rooms = new Map();

// MIME type map for static serving
const MIME_TYPES = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2"
};

// ── HTTP Server ─────────────────────────────────────────────────────────────
const httpServer = http.createServer((req, res) => {
  // Enable CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    return res.end();
  }

  // Health check endpoint
  if (req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ status: "ok", rooms: rooms.size, timestamp: new Date().toISOString() }));
  }

  // Sanitize static file request path
  let reqPath = req.url.split("?")[0];
  if (reqPath === "/") reqPath = "/index.html";

  const safePath = path.normalize(reqPath).replace(/^(\.\.[\/\\])+/, "");
  const filePath = path.join(__dirname, safePath);

  // Security check: ensure path stays within root
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403);
    return res.end("Forbidden");
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Fallback to index.html for client routing
      const indexPath = path.join(__dirname, "index.html");
      fs.readFile(indexPath, (err2, content) => {
        if (err2) {
          res.writeHead(404, { "Content-Type": "text/plain" });
          res.end("404 Not Found");
        } else {
          res.writeHead(200, { "Content-Type": "text/html" });
          res.end(content);
        }
      });
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";

    fs.readFile(filePath, (err2, content) => {
      if (err2) {
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Internal Server Error");
      } else {
        res.writeHead(200, { "Content-Type": contentType });
        res.end(content);
      }
    });
  });
});

// ── WebSocket Server ────────────────────────────────────────────────────────
const wss = new WebSocketServer({ server: httpServer });

// Ping-pong heartbeat to purge dead connections
const heartbeatInterval = setInterval(() => {
  wss.clients.forEach((ws) => {
    if (ws.isAlive === false) {
      console.log("[ws] Terminating inactive client connection");
      return ws.terminate();
    }
    ws.isAlive = false;
    ws.ping();
  });
}, 30000);

wss.on("close", () => {
  clearInterval(heartbeatInterval);
});

wss.on("connection", (ws) => {
  ws.isAlive = true;
  ws.on("pong", () => { ws.isAlive = true; });

  let roomId  = null;
  let peerId  = null; // "peer0" or "peer1"
  let partner = null; // reference to peer's WebSocket

  console.log(`[+] New connection (total active: ${wss.clients.size})`);

  ws.on("message", (raw) => {
    let msg;
    try {
      msg = JSON.parse(raw);
    } catch {
      return send(ws, { type: "error", message: "Invalid JSON format" });
    }

    switch (msg.type) {
      // ── JOIN ──────────────────────────────────────────────────────────────
      case "join": {
        const rid = msg.roomId;
        if (!rid || typeof rid !== "string" || rid.length > 64) {
          return send(ws, { type: "error", message: "Invalid or missing roomId" });
        }
        roomId = rid;

        if (!rooms.has(roomId)) {
          // First peer (creator)
          rooms.set(roomId, [ws, null]);
          peerId  = "peer0";
          partner = null;
          send(ws, { type: "joined", peerId: "peer0", roomId });
          console.log(`[room:${roomId}] peer0 joined (room created)`);
        } else {
          const peers = rooms.get(roomId);
          if (peers[1] !== null && peers[1] !== ws) {
            // Room is occupied
            return send(ws, { type: "error", message: "Room is full (max 2 participants)" });
          }
          // Second peer (joiner)
          peers[1] = ws;
          peerId   = "peer1";
          partner  = peers[0];

          // Link cross-references
          if (partner) {
            partner.partnerWs = ws;
            ws.partnerWs = partner;
            send(partner, { type: "peer-joined", peerId: "peer1" });
          }
          send(ws, { type: "joined", peerId: "peer1", roomId });
          console.log(`[room:${roomId}] peer1 joined (session ready)`);
        }
        break;
      }

      // ── RELAY ─────────────────────────────────────────────────────────────
      case "offer":
      case "answer":
      case "ice-candidate":
      case "leave":
      case "media-state":
      case "chat":
      case "screen-share-state": {
        const target = partner || ws.partnerWs;
        if (!target || target.readyState !== 1 /* OPEN */) {
          return send(ws, { type: "error", message: "Partner not connected" });
        }
        send(target, { ...msg, from: peerId });
        break;
      }

      default:
        send(ws, { type: "error", message: `Unknown message type: ${msg.type}` });
    }
  });

  ws.on("close", () => {
    console.log(`[-] Connection closed (room:${roomId}, peer:${peerId})`);
    if (!roomId) return;

    const peers = rooms.get(roomId);
    if (peers) {
      const surviving = peers.find(p => p && p !== ws && p.readyState === 1);
      if (surviving) {
        send(surviving, { type: "peer-left", peerId });
        surviving.partnerWs = null;
      }
      rooms.delete(roomId);
      console.log(`[room:${roomId}] room destroyed`);
    }
  });

  ws.on("error", (err) => {
    console.error(`WebSocket error (room:${roomId}):`, err.message);
  });
});

function send(ws, obj) {
  if (ws && ws.readyState === 1 /* OPEN */) {
    ws.send(JSON.stringify(obj));
  }
}

httpServer.listen(PORT, () => {
  console.log(`🚀 Vyne server listening on http://localhost:${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
});

