import http from "node:http";
import net from "node:net";
import { timingSafeEqual } from "node:crypto";

const port = Number(process.env.PORT || 8080);
const clamdHost = process.env.CLAMD_HOST || "clamav";
const clamdPort = Number(process.env.CLAMD_PORT || 3310);
const apiKey = process.env.MALWARE_SCANNER_API_KEY || "";
const maxBytes = 10 * 1024 * 1024;

function pingClamd() {
  return new Promise((resolve, reject) => {
    const socket = net.createConnection({ host: clamdHost, port: clamdPort });
    let output = Buffer.alloc(0);
    let done = false;
    const finish = error => {
      if (done) return;
      done = true;
      socket.destroy();
      if (error) reject(error);
      else if (/^PONG$/.test(output.toString("utf8").replace(/\0+$/, "").trim())) resolve();
      else reject(new Error("Invalid ClamAV health response"));
    };
    socket.setTimeout(3000, () => finish(new Error("ClamAV health timeout")));
    socket.on("error", finish);
    socket.on("data", chunk => {
      output = Buffer.concat([output, chunk]);
      if (output.length > 128) finish(new Error("ClamAV health response too large"));
      else if (output.includes(0)) finish();
    });
    socket.on("connect", () => socket.write(Buffer.from("zPING\0")));
  });
}

function scan(data) {
  return new Promise((resolve, reject) => {
    const socket = net.createConnection({ host: clamdHost, port: clamdPort });
    let output = Buffer.alloc(0);
    let done = false;
    const finish = error => {
      if (done) return;
      done = true;
      socket.destroy();
      if (error) reject(error);
      else {
        const result = output.toString("utf8").replace(/\0+$/, "");
        if (/\bOK\s*$/.test(result)) resolve("clean");
        else if (/FOUND/.test(result)) resolve("infected");
        else reject(new Error("Invalid ClamAV response"));
      }
    };
    socket.setTimeout(30000, () => finish(new Error("ClamAV timeout")));
    socket.on("error", finish);
    socket.on("data", chunk => {
      output = Buffer.concat([output, chunk]);
      if (output.length > 4096) finish(new Error("ClamAV response too large"));
      else if (output.includes(0)) finish();
    });
    socket.on("connect", () => {
      socket.write(Buffer.from("zINSTREAM\0"));
      for (let offset = 0; offset < data.length; offset += 65536) {
        const chunk = data.subarray(offset, Math.min(offset + 65536, data.length));
        const size = Buffer.alloc(4);
        size.writeUInt32BE(chunk.length);
        socket.write(size);
        socket.write(chunk);
      }
      socket.write(Buffer.alloc(4));
    });
  });
}

const server = http.createServer(async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  if (req.method === "GET" && req.url === "/healthz") {
    try {
      await pingClamd();
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ status: "ok", engine: "clamav", ready: true }));
    } catch {
      res.writeHead(503, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ status: "unavailable", engine: "clamav", ready: false }));
    }
    return;
  }
  if (req.method !== "POST" || req.url !== "/scan") {
    res.writeHead(404); res.end(); return;
  }
  const supplied = Buffer.from((req.headers.authorization || "").replace(/^Bearer\s+/i, ""));
  const expected = Buffer.from(apiKey);
  if (!apiKey || supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) {
    res.writeHead(401); res.end(JSON.stringify({ error: "unauthorized" })); return;
  }
  if (req.headers["content-type"] !== "application/octet-stream") {
    res.writeHead(415); res.end(JSON.stringify({ error: "binary_body_required" })); return;
  }
  const chunks = [];
  let total = 0;
  let rejected = false;
  req.on("data", chunk => {
    total += chunk.length;
    if (total > maxBytes) {
      rejected = true;
      res.writeHead(413); res.end(JSON.stringify({ error: "file_too_large" }));
      req.destroy();
    } else chunks.push(chunk);
  });
  req.on("end", async () => {
    if (rejected) return;
    try {
      const verdict = await scan(Buffer.concat(chunks));
      if (verdict === "infected") {
        res.writeHead(422, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ clean: false, engine: "clamav" }));
      } else {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ clean: true, engine: "clamav" }));
      }
    } catch {
      res.writeHead(503, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "scanner_unavailable" }));
    }
  });
});

server.listen(port, "0.0.0.0");
