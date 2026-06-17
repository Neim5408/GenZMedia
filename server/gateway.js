const http = require('http');
const httpProxy = require('http-proxy');

// Inisialisasi proxy
const proxy = httpProxy.createProxyServer({});

// Tangani error agar gateway tidak crash jika ada service lokal yang mati
proxy.on('error', (err, req, res) => {
  console.error('[Gateway Proxy Error]:', err.message);
  if (!res.headersSent) {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Koneksi ke service lokal terputus.');
  }
});

// Mapping path request ke port service lokal
const portMapping = {
  '/auth': 'http://localhost:5000',
  '/user': 'http://localhost:50052',
  '/post': 'http://localhost:50053',
  '/story': 'http://localhost:50053',
  '/comment': 'http://localhost:50054',
  '/reaction': 'http://localhost:50055',
  '/notification': 'http://localhost:50056',
  '/chat': 'http://localhost:50057',
  '/admin': 'http://localhost:50060'
};

const server = http.createServer((req, res) => {
  const url = req.url;

  // 1. Routing Upload File Statis berdasarkan prefix nama file
  if (url.startsWith('/uploads/')) {
    const filename = url.replace('/uploads/', '');
    if (filename.startsWith('avatar-') || filename.startsWith('cover-')) {
      proxy.web(req, res, { target: 'http://localhost:50052' }); // user-service
    } else if (filename.startsWith('post-')) {
      proxy.web(req, res, { target: 'http://localhost:50053' }); // post-service
    } else if (filename.startsWith('chat-')) {
      proxy.web(req, res, { target: 'http://localhost:50057' }); // chat-service
    } else {
      proxy.web(req, res, { target: 'http://localhost:50052' }); // fallback
    }
    return;
  }

  // 2. Routing Request HTTP Berdasarkan Path Prefix
  for (const prefix in portMapping) {
    if (url.startsWith(prefix)) {
      proxy.web(req, res, { target: portMapping[prefix] });
      return;
    }
  }

  // Jika rute tidak dikenali
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Gateway: Rute tidak ditemukan.');
});

// 3. Routing Koneksi WebSocket (Chat & Notifikasi)
server.on('upgrade', (req, socket, head) => {
  // Gunakan parser URL untuk membaca query string 'service'
  const urlObj = new URL(req.url, `http://${req.headers.host}`);
  const service = urlObj.searchParams.get('service');

  if (service === 'chat') {
    console.log('WS: Routing ke Chat Service (Port 50057)');
    proxy.ws(req, socket, head, { target: 'ws://localhost:50057' });
  } else if (service === 'notification') {
    console.log('WS: Routing ke Notification Service (Port 50056)');
    proxy.ws(req, socket, head, { target: 'ws://localhost:50056' });
  } else {
    // Fallback default ke chat-service
    proxy.ws(req, socket, head, { target: 'ws://localhost:50057' });
  }
});

// Jalankan gateway di port 8080
server.listen(8080, () => {
  console.log('====================================================');
  console.log('🚀 Local Gateway aktif di port 8080');
  console.log('👉 Sekarang jalankan di terminal baru: ngrok http 8080');
  console.log('====================================================');
});