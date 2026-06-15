require('dotenv').config();
const express = require('express');
const cors = require('cors');
const commentRoutes = require('./src/routes/commentRoutes');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/comment', commentRoutes);

const PORT = process.env.PORT || 50054;
app.listen(PORT, () => {
  console.log(`Comment Service berjalan di port ${PORT} (MSC Architecture)`);
});