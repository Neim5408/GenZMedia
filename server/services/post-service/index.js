require('dotenv').config();
const express = require('express');
const cors = require('cors');
const postRoutes = require('./src/routes/postRoutes');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/post', postRoutes);

const PORT = process.env.PORT || 50053;
app.listen(PORT, () => {
    console.log(`Post Service berjalan di port ${PORT} (MSC Architecture)`);
});