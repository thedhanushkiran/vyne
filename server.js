/**
 * Signaling Server for WebRTC Video Calls
 * ----------------------------------------
 * Responsibilities:
 *  - Assign clients to named "rooms" (room ID comes from the URL fragment)
 *  - Relay offer/answer/ICE messages between exactly two peers in a room
 *  - Clean up rooms when peers disconnect
 *
 * This server NEVER sees any media — it only shuttles small JSON envelopes
 * during the ~2-5 seconds of WebRTC handshake. After that, media flows
 * peer-to-peer and this server is idle for that call.
 */

const http  = require("http");
const { WebSocketServer } = require("ws");
const crypto = require("crypto");

const PORT = process.env.PORT || 8080;

// rooms: Map<roomId, [ws1, ws2?]>
const rooms = new Map();

// ── HTTP server (health-check endpoint + CORS pre-flight) ──────────────────
const httpServer = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.url === "/health") {
    res.writeHead(200);
    res.end(JSON.stringify({ status: "ok", rooms: rooms.size }));
  } else {
    res.writeHead(404);
    res.end("Not found");
  }
});

// ── WebSocket server ───────────────────────────────────────────────────────
const wss = new WebSocketServer({ server: httpServer });

wss.on("connection", (ws, req) => {
  let roomId   = null;
  let peerId   = null;    // "peer0" or "peer1" within the room
  let partner  = null;    // reference to the other WebSocket in the room

  console.log(`[+] New connection  (total: ${wss.clients.size})`);

  ws.on("message", (raw) => {
    let msg;
    try {
      msg = JSON.parse(raw);
    } catch {
      return send(ws, { type: "error", message: "Invalid JSON" });
    }

    switch (msg.type) {

      // ── JOIN ──────────────────────────────────────────────────────────────
      // First message every client sends: { type:"join", roomId:"abc123" }
      // Server assigns the client as peer0 (creator) or peer1 (joiner).
      case "join": {
        const rid = msg.roomId;
        if (!rid || typeof rid !== "string" || rid.length > 32) {
          return send(ws, { type: "error", message: "Invalid roomId" });
        }
        roomId = rid;

        if (!rooms.has(roomId)) {
          // First peer creates the room
          rooms.set(roomId, [ws, null]);
          peerId  = "peer0";
          partner = null;
          send(ws, { type: "joined", peerId: "peer0", roomId });
          console.log(`[room ${roomId}] peer0 joined (room created)`);
        } else {
          const peers = rooms.get(roomId);
          if (peers[1] !== null) {
            // Room full
            return send(ws, { type: "error", message: "Room is full" });
          }
          // Second peer joins
          peers[1] = ws;
          peerId   = "peer1";
          partner  = peers[0];
          // Also tell peer0 that peer1 has arrived so it can initiate the offer
          send(partner, { type: "peer-joined", peerId: "peer1" });
          send(ws,      { type: "joined",      peerId: "peer1", roomId });
          console.log(`[room ${roomId}] peer1 joined (call can start)`);
        }
        break;
      }

      // ── RELAY: offer / answer / ice-candidate / leave ─────────────────────
      // Any other message type is blindly forwarded to the partner.
      // Media never passes through here — only small SDP/ICE JSON blobs.
      case "offer":
      case "answer":
      case "ice-candidate":
      case "leave":
      case "media-state": {  // notify partner of mute/video-off events
        if (!partner || partner.readyState !== 1 /* OPEN */) {
          return send(ws, { type: "error", message: "No partner connected yet" });
        }
        // Forward as-is; attach senderId so receiver knows who sent it
        send(partner, { ...msg, from: peerId });
        break;
      }

      default:
        send(ws, { type: "error", message: `Unknown message type: ${msg.type}` });
    }
  });

  ws.on("close", () => {
    console.log(`[-] Connection closed  (room: ${roomId}, peer: ${peerId})`);
    if (!roomId) return;

    const peers = rooms.get(roomId);
    if (!peers) return;

    // Notify the surviving partner that the other side left
    const surviving = peers.find(p => p && p !== ws && p.readyState === 1);
    if (surviving) {
      send(surviving, { type: "peer-left", peerId });
    }

    // Clean up room
    rooms.delete(roomId);
    console.log(`[room ${roomId}] cleaned up`);
  });

  ws.on("error", (err) => {
    console.error(`WebSocket error (room: ${roomId}):`, err.message);
  });
});

function send(ws, obj) {
  if (ws.readyState === 1 /* OPEN */) {
    ws.send(JSON.stringify(obj));
  }
}

httpServer.listen(PORT, () => {
  console.log(`Signaling server listening on port ${PORT}`);
  console.log(`Health: http://localhost:${PORT}/health`);
});
