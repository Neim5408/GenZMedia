require('dotenv').config();
const express = require('express');
const cors = require('cors');
const reactionRoutes = require('./src/routes/reactionRoutes');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/reaction', reactionRoutes);

const PORT = process.env.PORT || 50055;
app.listen(PORT, () => {
  console.log(`Reaction Service berjalan di port ${PORT} (MSC Architecture)`);
});