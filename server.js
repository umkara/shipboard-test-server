// Tiny test server for Shipboard (iOS hosting console). No dependencies.
// Routes produce the things the app has to show: logs, errors, slow requests, health.
const http = require("node:http");

const port = Number(process.env.PORT) || 8080;
const startedAt = new Date();
let requests = 0;

function log(level, message, extra = {}) {
  console.log(JSON.stringify({ time: new Date().toISOString(), level, message, ...extra }));
}

const routes = {
  "/": (req, res) => send(res, 200, `Shipboard test server. Up since ${startedAt.toISOString()}. Requests: ${requests}\n`),
  "/healthz": (req, res) => send(res, 200, "ok\n"),
  // 500 with an error log line, to test failed-request metrics and log levels.
  "/error": (req, res) => {
    log("error", "Simulated failure", { path: req.url });
    send(res, 500, "simulated error\n");
  },
  // Answers after 2 s, to test latency charts.
  "/slow": (req, res) => setTimeout(() => send(res, 200, "slow ok\n"), 2000),
  // Writes several log lines of each level at once, to test log search and colours.
  "/burst": (req, res) => {
    for (let i = 1; i <= 5; i++) {
      log("info", `Burst line ${i}`);
      log("warn", `Burst warning ${i}`);
    }
    log("error", "Burst error");
    send(res, 200, "11 log lines written\n");
  },
};

function send(res, status, body) {
  res.writeHead(status, { "content-type": "text/plain; charset=utf-8" });
  res.end(body);
}

http
  .createServer((req, res) => {
    requests++;
    const path = new URL(req.url, "http://localhost").pathname;
    const route = routes[path];
    if (path !== "/healthz") log("info", "request", { method: req.method, path });
    if (route) return route(req, res);
    send(res, 404, "not found\n");
  })
  .listen(port, () => log("info", `listening on ${port}`));

// Fly stops idle machines with SIGINT, Render with SIGTERM; log it so the app can show why.
for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    log("info", `received ${signal}, shutting down`);
    process.exit(0);
  });
}
