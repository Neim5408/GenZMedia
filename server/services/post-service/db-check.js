const pool = require('./db');

const query = `SELECT table_schema, table_name FROM information_schema.tables WHERE table_schema IN ('post_db', 'user_db') AND table_name IN ('stories', 'users_profile', 'follows')`;

pool.query(query)
  .then(res => {
    console.log(JSON.stringify(res.rows, null, 2));
    pool.end();
  })
  .catch(err => {
    console.error(err);
    pool.end();
    process.exit(1);
  });
