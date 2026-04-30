require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http'); // Dibutuhkan untuk Socket.io
const { Server } = require('socket.io');
const notificationRoutes = require('./src/routes/notificationRoutes');

const app = express();
app.use(cors());
app.use(express.json());

// Setup HTTP Server & WebSockets
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" } // Mengizinkan frontend (Vite) konek ke sini
});

// Menyimpan 'io' ke app, supaya bisa dipakai di controller nanti!
app.set('io', io);

// Logika Real-time Socket.io
io.on('connection', (socket) => {
  console.log('Frontend terhubung ke Notification WebSockets:', socket.id);

  // Saat frontend/user login, dia akan masuk ke "kamar" dengan nama ID-nya sendiri
  socket.on('joinNotificationRoom', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} siap menerima notifikasi real-time`);
  });

  socket.on('disconnect', () => {
    console.log('Frontend terputus:', socket.id);
  });
});

app.use('/notification', notificationRoutes);

const PORT = process.env.PORT || 50056;
server.listen(PORT, () => {
  console.log(`Notification Service berjalan di port ${PORT} (MSC + WebSockets)`);
});