const http = require('http');

const TARGET_PORT = 5000;
const PROXY_PORT = 24678;

const server = http.createServer((req, res) => {
  const options = {
    hostname: '127.0.0.1',
    port: TARGET_PORT,
    path: req.url,
    method: req.method,
    headers: req.headers,
  };

  const proxy = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });

  proxy.on('error', () => {
    res.writeHead(502);
    res.end('Bad Gateway');
  });

  req.pipe(proxy, { end: true });
});

server.on('upgrade', (req, socket, head) => {
  const net = require('net');
  const conn = net.connect(TARGET_PORT, '127.0.0.1', () => {
    conn.write(
      `${req.method} ${req.url} HTTP/1.1\r\n` +
      Object.keys(req.headers).map(k => `${k}: ${req.headers[k]}`).join('\r\n') +
      '\r\n\r\n'
    );
    conn.write(head);
    socket.pipe(conn);
    conn.pipe(socket);
  });
  conn.on('error', () => socket.destroy());
  socket.on('error', () => conn.destroy());
});

server.listen(PROXY_PORT, '0.0.0.0', () => {
  console.log(`Proxy running on port ${PROXY_PORT} -> ${TARGET_PORT}`);
});
