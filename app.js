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

redisClient.on('connect', () => {
    console.log('Connected to Redis');
});

redisClient.connect();

app.get('/users', async (req, res) => {
    try {
        // Check Redis cache first:
        const cachedUsers =  await redisClient.get('users')

        if (cachedUsers) {
            console.log('Cache hit!!!');
            return res.json(JSON.parse(cachedUsers));
        } else {
            console.log('Cache miss :\'(');

            // Fetch from Postgres DB
            const result = await pool.query('Select * FROM users');
            const users = await result.rows;

            // Store in Redis w/ expiration time of 3600 sec (1 hr)
            await redisClient.setEx('users', 3600, JSON.stringify(users));

            return res.json(users);
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}...`));