const express = require('express');
const { Pool } = require('pg');
const redis = require('redis');

const app = express();

//* PostgreSQL client setup
const pool = new Pool({
    user: 'jacob',
    host: 'localhost',
    database: 'cachedemo',
    password: 'password',
    port: 5432
});

//* Redis client setup
const redisClient = redis.createClient();

redisClient.on('error', (err) => {
    console.error('Redis error: ', err);
});


app.get('/users', async (req, res) => {
    try {
        // Check Redis cache first:
        redisClient.get('users', async (err, users) => {
            if (err) throw err;

            if (users) {
                console.log('Cache hit');
                return res.json(JSON.parse(users));
            } else {
                console.log('Cache miss');

                // Fetch from PostgreSQL DB
                const result = await pool.query('SELECT * FROM users');
                const users = result.rows;

                // Store in Redis
                redisClient.setEx('users', 3600, JSON.stringify(users));

                return res.json(users);
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}...`));