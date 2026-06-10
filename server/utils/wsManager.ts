import { Server } from "http";
import { WebSocketServer, WebSocket } from "ws";

let wss: WebSocketServer | null = null;
const connectionsPerIp = new Map<string, number>();
const MAX_CONNECTIONS_PER_IP = 5;

// Record active socket connections
const activeClients = new Set<WebSocket>();

export function initWebSocketServer(server: Server) {
  wss = new WebSocketServer({ noServer: true });

  server.on("upgrade", (request, socket, head) => {
    // Basic IP rate limiting check
    const ip = request.socket.remoteAddress || "unknown";
    const currentCount = connectionsPerIp.get(ip) || 0;

    if (currentCount >= MAX_CONNECTIONS_PER_IP) {
      console.warn(`[WS] Connection rejected for ${ip}: Exceeded max limit of ${MAX_CONNECTIONS_PER_IP} connections.`);
      socket.write("HTTP/1.1 429 Too Many Requests\r\n\r\n");
      socket.destroy();
      return;
    }

    wss?.handleUpgrade(request, socket, head, (ws) => {
      wss?.emit("connection", ws, request);
    });
  });

  wss.on("connection", (ws: WebSocket, request) => {
    const ip = request.socket.remoteAddress || "unknown";
    
    // Register connection
    connectionsPerIp.set(ip, (connectionsPerIp.get(ip) || 0) + 1);
    activeClients.add(ws);
    
    // console.log(`[WS] Client connected from ${ip}. Total connections from this IP: ${connectionsPerIp.get(ip)}`);

    ws.on("message", (message) => {
      // Echo / ping responses to keep connections active
      try {
        const parsed = JSON.parse(message.toString());
        if (parsed.type === "ping") {
          ws.send(JSON.stringify({ type: "pong" }));
        }
      } catch (e) {
        // ignore
      }
    });

    ws.on("close", () => {
      // Unregister connection
      const currentCount = connectionsPerIp.get(ip) || 1;
      if (currentCount <= 1) {
        connectionsPerIp.delete(ip);
      } else {
        connectionsPerIp.set(ip, currentCount - 1);
      }
      activeClients.delete(ws);
      // console.log(`[WS] Client disconnected from ${ip}. Remaining active: ${connectionsPerIp.get(ip) || 0}`);
    });

    ws.on("error", (err) => {
      console.error(`[WS] Error on connection for ${ip}:`, err);
    });

    // Send initial greeting
    ws.send(JSON.stringify({ type: "connected", message: "Cooperative cyber-feed initiated." }));
  });
}

// Broadcast updates to all active clients
export function broadcastUpdate(type: "menu_updated" | "config_updated", data?: any) {
  if (!wss) return;
  const payload = JSON.stringify({ type, data });
  
  // console.log(`[WS] Broadcasting ${type} to ${activeClients.size} clients.`);
  
  for (const client of activeClients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  }
}
