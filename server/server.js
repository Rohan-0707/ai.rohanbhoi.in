"use strict";

require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });

const http = require("http");
const { Server } = require("socket.io");

const PORT = parseInt(process.env.SOCKET_PORT || "3001", 10);
const ADMIN_SECRET = process.env.ADMIN_SECRET;
const NODE_ENV = process.env.NODE_ENV || "development";

const ALLOWED_ORIGINS = [
  "https://ai.rohanbhoi.in",
  "http://localhost:2510",
];

function log(level, message, meta = {}) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    service: "jalvayu-socket",
    message,
    ...meta,
  };
  const output = JSON.stringify(entry);
  if (level === "error") {
    console.error(output);
  } else {
    console.log(output);
  }
}

function isOriginAllowed(origin) {
  if (!origin) {
    return true;
  }
  return ALLOWED_ORIGINS.includes(origin);
}

function resolveCorsOrigin(requestOrigin) {
  if (requestOrigin && isOriginAllowed(requestOrigin)) {
    return requestOrigin;
  }
  return ALLOWED_ORIGINS[0];
}

function setCorsHeaders(res, origin) {
  res.setHeader("Access-Control-Allow-Origin", resolveCorsOrigin(origin));
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization",
  );
}

function sendJson(res, statusCode, payload, origin) {
  setCorsHeaders(res, origin);
  res.writeHead(statusCode, { "Content-Type": "application/json" });
  res.end(JSON.stringify(payload));
}

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];

    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

function parseAuthorizationToken(authHeader) {
  if (!authHeader) {
    return null;
  }

  return authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : authHeader;
}

function buildDefaultAlertPayload() {
  return {
    type: "FLASH_FLOOD",
    severity: "CRITICAL",
    headline: "Emergency: Flash Flood Warning",
    message:
      "Severe waterlogging detected in Yelahanka New Town. Seek higher ground immediately. Do not attempt to cross flooded roadways.",
    timestamp: new Date().toISOString(),
  };
}

function resolveAlertPayload(body) {
  const defaults = buildDefaultAlertPayload();

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return defaults;
  }

  return {
    type: typeof body.type === "string" ? body.type : defaults.type,
    severity:
      typeof body.severity === "string" ? body.severity : defaults.severity,
    headline:
      typeof body.headline === "string" ? body.headline : defaults.headline,
    message: typeof body.message === "string" ? body.message : defaults.message,
    timestamp: new Date().toISOString(),
  };
}

function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0].trim();
  }
  return req.socket.remoteAddress || "unknown";
}

async function handleHttpRequest(req, res) {
  const origin = req.headers.origin;
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const pathname = url.pathname;

  if (req.method === "OPTIONS") {
    setCorsHeaders(res, origin);
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === "GET" && pathname === "/health") {
    sendJson(
      res,
      200,
      {
        status: "ok",
        service: "jalvayu-socket",
        connections: io.engine.clientsCount,
        allowedOrigins: ALLOWED_ORIGINS,
        timestamp: new Date().toISOString(),
      },
      origin,
    );
    return;
  }

  if (req.method === "POST" && pathname === "/api/admin/trigger-alert") {
    if (!ADMIN_SECRET) {
      log("error", "ADMIN_SECRET is not configured");
      sendJson(res, 503, { error: "Admin alerts are not configured" }, origin);
      return;
    }

    const token = parseAuthorizationToken(req.headers.authorization);

    if (!token || token !== ADMIN_SECRET) {
      log("warn", "Unauthorized admin trigger attempt", {
        ip: getClientIp(req),
      });
      sendJson(res, 401, { error: "Unauthorized" }, origin);
      return;
    }

    let body = null;

    try {
      const rawBody = await readRequestBody(req);
      body = rawBody ? JSON.parse(rawBody) : null;
    } catch (error) {
      log("warn", "Invalid JSON body on admin trigger", {
        error: error.message,
      });
      sendJson(res, 400, { error: "Invalid JSON body" }, origin);
      return;
    }

    const payload = resolveAlertPayload(body);
    const recipients = io.engine.clientsCount;

    io.emit("severe_weather_alert", payload);

    log("info", "Jury Mode alert triggered", {
      event: "severe_weather_alert",
      type: payload.type,
      severity: payload.severity,
      headline: payload.headline,
      recipients,
      triggeredBy: getClientIp(req),
    });

    sendJson(
      res,
      200,
      {
        ok: true,
        broadcast: payload,
        recipients,
      },
      origin,
    );
    return;
  }

  sendJson(res, 404, { error: "Not found" }, origin);
}

const httpServer = http.createServer((req, res) => {
  const pathname = new URL(
    req.url || "/",
    `http://${req.headers.host || "localhost"}`,
  ).pathname;

  if (pathname === "/socket.io" || pathname.startsWith("/socket.io/")) {
    return;
  }

  handleHttpRequest(req, res).catch((error) => {
    log("error", "Unhandled HTTP request error", { error: error.message });
    sendJson(res, 500, { error: "Internal server error" }, req.headers.origin);
  });
});

const io = new Server(httpServer, {
  cors: {
    origin: ALLOWED_ORIGINS,
    methods: ["GET", "POST"],
    credentials: true,
  },
  pingInterval: 25000,
  pingTimeout: 20000,
});

io.on("connection", (socket) => {
  log("info", "Client connected", {
    socketId: socket.id,
    transport: socket.conn.transport.name,
  });

  socket.emit("connected", {
    socketId: socket.id,
    message: "Connected to JalVayu AI real-time server",
    timestamp: new Date().toISOString(),
  });

  socket.on("disconnect", (reason) => {
    log("info", "Client disconnected", {
      socketId: socket.id,
      reason,
    });
  });

  socket.on("error", (error) => {
    log("error", "Socket error", {
      socketId: socket.id,
      error: error.message,
    });
  });
});

httpServer.listen(PORT, "0.0.0.0", () => {
  log("info", "Socket server listening", {
    port: PORT,
    allowedOrigins: ALLOWED_ORIGINS,
    nodeEnv: NODE_ENV,
  });
});

process.on("SIGINT", () => {
  log("info", "Shutting down gracefully (SIGINT)");
  io.close();
  httpServer.close(() => process.exit(0));
});

process.on("SIGTERM", () => {
  log("info", "Shutting down gracefully (SIGTERM)");
  io.close();
  httpServer.close(() => process.exit(0));
});

module.exports = { httpServer, io };
