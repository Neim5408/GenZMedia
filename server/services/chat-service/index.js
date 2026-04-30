require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const chatRoutes = require('./src/routes/chatRoutes');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

app.set('io', io);

// JANTUNG REAL-TIME CHAT
io.on('connection', (socket) => {
  console.log('User terhubung ke Chat WebSockets:', socket.id);

  // User bergabung ke "kamar" pribadi menggunakan ID mereka
  socket.on('joinChat', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} siap menerima pesan real-time`);
  });

  // Saat user sedang mengetik... (Frontend bisa menangkap ini untuk tulisan "typing...")
  socket.on('typing', (data) => {
    socket.to(data.receiver_id).emit('userTyping', data.sender_id);
  });

  socket.on('disconnect', () => {
    console.log('User terputus dari Chat WebSockets');
  });
});

app.use('/chat', chatRoutes);

const PORT = process.env.PORT || 50057;
server.listen(PORT, () => {
  console.log(`Chat Service berjalan di port ${PORT} (MSC + WebSockets)`);
});