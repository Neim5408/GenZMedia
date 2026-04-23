require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const { Pool } = require('pg');

const pool = new Pool({
<<<<<<< HEAD
  user: 'postgres',
  password: 'Faiz050105',
  host: 'localhost',
  port: 5432,
  database: 'postgres'
}); 
=======
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
});
>>>>>>> 6e874cfdbed012297065195fdc64c058a3d2481e

module.exports = pool;