// server/index.js
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json());

// Where we expect the built client
const publicDir = path.join(__dirname, 'public');                // optional copied build
const clientDist = path.join(__dirname, '..', 'client', 'dist'); // vite build

// choose folder to serve (public takes priority)
let serveFrom = null;
if (fs.existsSync(publicDir) && fs.statSync(publicDir).isDirectory()) {
  serveFrom = publicDir;
} else if (fs.existsSync(clientDist) && fs.statSync(clientDist).isDirectory()) {
  serveFrom = clientDist;
}

if (serveFrom) {
  console.log('Serving frontend from', serveFrom);
  app.use(express.static(serveFrom));
} else {
  console.log('No frontend build found (checked):', publicDir, clientDist);
}

// --- API routes (define before SPA fallback) ---
app.get('/api/ping', (req, res) => res.json({ ok: true }));


// --- SPA fallback middleware (no path-to-regexp parsing) ---
app.use((req, res) => {
  // If request looks like an API call and no API route matched, return JSON 404
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ message: 'API endpoint not found' });
  }

  // If we have a frontend build, serve index.html for client-side routing
  if (serveFrom) {
    return res.sendFile(path.join(serveFrom, 'index.html'));
  }

  // Otherwise, plain message
  res.status(200).send('Server running. No frontend build found.');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started on ${PORT}`));
