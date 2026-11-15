import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import net from "node:net";
import { spawn } from "node:child_process";

const API_KEY = "scanner-ci-test-key";
let clamd;
let scanner;
let clamdPort;
let scannerPort;
let scannerBase;
let scanMode = "clean";
let clamdSockets = new Set();

function listen(server) {
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      server.removeListener("error", reject);
      resolve(server.address().port);
    });
  });
}

function close(server) {
  return new Promise(resolve => {
    if (!server?.listening) return resolve();
    for (const socket of clamdSockets) socket.destroy();
    server.close(() => resolve());
  });
}

function makeClamdMock() {
  return net.createServer(socket => {
    clamdSockets.add(socket);
    socket.on("close", () => clamdSockets.delete(socket));
    let input = Buffer.alloc(0);
    let replied = false;
    socket.on("data", chunk => {
      if (replied) return;
      input = Buffer.concat([input, chunk]);
      if (input.subarray(0, 6).toString() === "zPING\\0") {
        replied = true;
        socket.end(Buffer.from("PONG\\0"));
        return;
      }
      const headerEnd = input.indexOf(0);
      if (headerEnd < 0 || input.subarray(0, headerEnd).toString() !== "zINSTREAM") return;
      let offset = headerEnd + 1;
      const payload = [];
      while (input.length - offset >= 4) {
        const size = input.readUInt32BE(offset);
        offset += 4;
        if (size === 0) {
          if (scanMode === "timeout") return;
          replied = true;
          const bytes = Buffer.concat(payload);
          const infected = bytes.includes(Buffer.from("EICAR_TEST_SIGNATURE"));
          socket.end(Buffer.from(infected ? "stream: Eicar-Test-Signature FOUND\\0" : "stream: OK\\0"));
          return;
        }
        if (input.length - offset < size) return;
        payload.push(input.subarray(offset, offset + size));
        offset += size;
      }
    });
  });
}

async function waitForScanner() {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      const response = await fetch(scannerBase + "/healthz");
      if (response.status === 200) return;
    } catch { /* process is still starting */ }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error("Scanner did not become ready");
}

before(async () => {
  clamd = makeClamdMock();
  clamdPort = await listen(clamd);
  const portProbe = net.createServer();
  scannerPort = await listen(portProbe);
  await close(portProbe);
  scannerBase = `http://127.0.0.1:${scannerPort}`;
  scanner = spawn(process.execPath, ["scanner/scan-server.mjs"], {
    env: {
      ...process.env,
      NODE_ENV: "test",
      PORT: String(scannerPort),
      CLAMD_HOST: "127.0.0.1",
      CLAMD_PORT: String(clamdPort),
      MALWARE_SCANNER_API_KEY: API_KEY,
    },
    stdio: ["ignore", "ignore", "pipe"],
  });
  let stderr = "";
  scanner.stderr.on("data", chunk => { stderr += chunk.toString(); });
  scanner.once("exit", code => {
    if (code !== 0 && code !== null) process.stderr.write(stderr);
  });
  await waitForScanner();
});

after(async () => {
  if (scanner && scanner.exitCode === null) {
    scanner.kill("SIGTERM");
    await new Promise(resolve => scanner.once("exit", resolve));
  }
  await close(clamd);
});

test("health endpoint requires a live ClamAV daemon", async () => {
  const response = await fetch(scannerBase + "/healthz");
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: "ok", engine: "clamav", ready: true });
});

test("rejects missing or incorrect scanner credentials", async () => {
  const response = await fetch(scannerBase + "/scan", {
    method: "POST",
    headers: { "Content-Type": "application/octet-stream", Authorization: "Bearer wrong-key" },
    body: Buffer.from("ordinary document"),
  });
  assert.equal(response.status, 401);
});

test("rejects non-binary scan requests", async () => {
  const response = await fetch(scannerBase + "/scan", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${API_KEY}` },
    body: JSON.stringify({ file: "not raw bytes" }),
  });
  assert.equal(response.status, 415);
});

test("returns a clean verdict only after ClamAV returns OK", async () => {
  scanMode = "clean";
  const response = await fetch(scannerBase + "/scan", {
    method: "POST",
    headers: { "Content-Type": "application/octet-stream", Authorization: `Bearer ${API_KEY}` },
    body: Buffer.from("ordinary document bytes"),
  });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { clean: true, engine: "clamav" });
});

test("returns an infected verdict when ClamAV reports FOUND", async () => {
  scanMode = "clean";
  const response = await fetch(scannerBase + "/scan", {
    method: "POST",
    headers: { "Content-Type": "application/octet-stream", Authorization: `Bearer ${API_KEY}` },
    body: Buffer.from("EICAR_TEST_SIGNATURE"),
  });
  assert.equal(response.status, 422);
  assert.deepEqual(await response.json(), { clean: false, engine: "clamav" });
});

test("fails closed when the scanner daemon is unavailable", async () => {
  await close(clamd);
  const response = await fetch(scannerBase + "/scan", {
    method: "POST",
    headers: { "Content-Type": "application/octet-stream", Authorization: `Bearer ${API_KEY}` },
    body: Buffer.from("ordinary document bytes"),
  });
  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), { error: "scanner_unavailable" });
  const health = await fetch(scannerBase + "/healthz");
  assert.equal(health.status, 503);
});
