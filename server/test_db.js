
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST && process.env.DB_HOST.trim(), // Try trimming in code to see if it fixes it, but logging raw first
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

console.log('--- DEBUG START ---');
console.log(`RAW_DB_HOST: '${process.env.DB_HOST}'`);
console.log(`RAW_DB_PORT: '${process.env.DB_PORT}'`);
console.log('--- DEBUG END ---');

pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.log('CONNECTION_ERROR: ' + err.message);
        // console.log('ERROR_DETAIL: ' + JSON.stringify(err));
    } else {
        console.log('CONNECTION_SUCCESS: ' + res.rows[0].now);
    }
    pool.end();
});
