'use strict';

const http = require('http');
const resultHandler = require('./api/result');

const PORT = Number(process.env.PORT) || 3000;

const server = http.createServer((req, res) => {
  const { pathname } = new URL(req.url, 'http://localhost');

  if (req.method === 'GET' && (pathname === '/result' || pathname === '/api/result' || pathname === '/')) {
    return resultHandler(req, res);
  }

  res.statusCode = 404;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}/result`);
});
