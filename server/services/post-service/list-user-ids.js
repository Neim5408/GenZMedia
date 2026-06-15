const pool = require('./db');

pool.query('SELECT id FROM user_db.users_profile LIMIT 10')
  .then(res => {
    console.log(JSON.stringify(res.rows, null, 2));
    pool.end();
  })
  .catch(err => {
    console.error(err);
    pool.end();
    process.exit(1);
  });
