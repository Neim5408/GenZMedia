require('dotenv').config();
const express = require('express');
const cors = require('cors');
const userRoutes = require('./src/routes/userRoutes');

const app = express();
app.use(cors());
app.use(express.json());

// PENTING: Menyajikan folder statis untuk menampung foto profil dan cover
// Saat frontend mencari foto, Express akan otomatis mencarinya di folder 'public/uploads'
app.use('/uploads', express.static('public/uploads'));

// Rute utama User Service
app.use('/user', userRoutes);

const PORT = process.env.PORT || 50052;
app.listen(PORT, () => {
  console.log(`User Service berjalan di port ${PORT}`);
});