#!/usr/bin/env node
/**
 * Simple static file server for the Prospector dashboard.
 * Serves from the prospector project root so relative paths to outputs/ work.
 *
 * Usage: node projects/prospector/presentation/serve.js [port]
 * Default port: 3456
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = parseInt(process.argv[2]) || 3456;

// Serve from the prospector project root (parent of presentation/)
const ROOT = path.resolve(__dirname, '..');

const MIME = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
};

const server = http.createServer((req, res) => {
  // CORS headers for local dev
  res.setHeader('Access-Control-Allow-Origin', '*');

  let filePath = path.join(ROOT, decodeURIComponent(req.url));

  // Default to presentation/index.html
  if (req.url === '/' || req.url === '') {
    filePath = path.join(ROOT, 'presentation', 'index.html');
  }

  // Directory → index.html
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  const ext = path.extname(filePath);
  const contentType = MIME[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found: ' + req.url);
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`Prospector dashboard: http://localhost:${PORT}`);
  console.log(`Serving from: ${ROOT}`);
  console.log('Press Ctrl+C to stop.');
});
