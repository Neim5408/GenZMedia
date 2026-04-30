require('dotenv').config();
const express = require('express');
const cors = require('cors');
const adminRoutes = require('./src/routes/adminRoutes');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/admin', adminRoutes);

const PORT = process.env.PORT || 50060;
app.listen(PORT, () => {
  console.log(`Admin Service berjalan di port ${PORT} (MSC Architecture)`);
});