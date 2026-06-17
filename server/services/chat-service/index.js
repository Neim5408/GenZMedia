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

// Map untuk menyimpan userId -> socket.id yang online
const onlineUsers = new Map();

// JANTUNG REAL-TIME CHAT
io.on('connection', (socket) => {
  console.log('User terhubung ke Chat WebSockets:', socket.id);

  // User bergabung ke "kamar" pribadi menggunakan ID mereka
  socket.on('joinChat', (userId) => {
    socket.join(userId);
    socket.userId = userId;
    onlineUsers.set(userId, socket.id);
    
    console.log(`User ${userId} siap menerima pesan real-time`);
    
    // Broadcast status online ke semua user
    io.emit('userOnline', userId);
    
    // Kirim daftar user yang sedang online saat ini ke client yang baru konek
    socket.emit('onlineUsersList', Array.from(onlineUsers.keys()));
  });

  // Saat user sedang mengetik...
  socket.on('typing', (data) => {
    if (data.receiver_id) {
      socket.to(data.receiver_id).emit('userTyping', data.sender_id);
    }
  });

  // Mengambil daftar user yang online
  socket.on('getOnlineUsers', () => {
    socket.emit('onlineUsersList', Array.from(onlineUsers.keys()));
  });

  // Saat user berhenti mengetik...
  socket.on('stopTyping', (data) => {
    if (data.receiver_id) {
      socket.to(data.receiver_id).emit('userStoppedTyping', data.sender_id);
    }
  });

  socket.on('disconnect', () => {
    if (socket.userId) {
      onlineUsers.delete(socket.userId);
      console.log(`User ${socket.userId} terputus dari Chat WebSockets`);
      // Broadcast status offline ke semua user
      io.emit('userOffline', socket.userId);
    } else {
      console.log('User terputus dari Chat WebSockets (tanpa login)');
    }
  });
});

app.use('/chat', chatRoutes);
app.use('/uploads', express.static('public/uploads'));

const PORT = process.env.PORT || 50057;
server.listen(PORT, () => {
  console.log(`Chat Service berjalan di port ${PORT} (MSC + WebSockets)`);
});