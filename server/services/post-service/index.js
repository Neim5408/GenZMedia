require('dotenv').config();
const express = require('express');
const cors = require('cors');
<<<<<<< HEAD
const path = require('path'); // 1. Tambahkan import path ini
const postRoutes = require('./src/routes/postRoutes');
const storyRoutes = require('./src/routes/storyRoutes');
const storyService = require('./src/services/storyService');
=======
const postRoutes = require('./src/routes/postRoutes');
>>>>>>> origin/Kibob_update_home

const app = express();
app.use(cors());
app.use(express.json());

<<<<<<< HEAD
// 2. Tambahkan baris ini untuk membuka folder 'public/uploads' ke publik!
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

app.use('/post', postRoutes);
app.use('/story', storyRoutes);

const cleanupExpiredStories = async () => {
  try {
    await storyService.deleteExpiredStories();
    console.log('Expired stories cleanup complete');
  } catch (error) {
    console.error('Expired stories cleanup failed', error);
  }
};

cleanupExpiredStories();
setInterval(cleanupExpiredStories, 60 * 60 * 1000); // run every hour
=======
app.use('/post', postRoutes);
>>>>>>> origin/Kibob_update_home

const PORT = process.env.PORT || 50053;
app.listen(PORT, () => {
    console.log(`Post Service berjalan di port ${PORT} (MSC Architecture)`);
});