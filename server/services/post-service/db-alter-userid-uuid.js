const pool = require('./db');

const sql = `ALTER TABLE post_db.stories ALTER COLUMN user_id TYPE uuid USING user_id::uuid;`;

pool.query(sql)
  .then(() => {
    console.log('Alter table complete');
    pool.end();
  })
  .catch(err => {
    console.error('Alter table error', err);
    pool.end();
    process.exit(1);
  });
