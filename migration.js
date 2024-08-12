const { Pool } = require('pg');
const { faker } = require('@faker-js/faker');

const pool = new Pool({
    user: 'jacob',
    host: 'localhost',
    database: 'cachedemo',
    password: 'password',
    port: 5432
});

async function insertUsers() {
    try {
        await pool.connect();

        for (let i = 0; i < 1000; i++) {
            const name = faker.person.fullName();
            const email = faker.internet.email();

            await pool.query('INSERT INTO USERS (name, email) VALUES ($1, $2)', [name, email]);

            if (i % 100 === 0) {
                console.log(`Inserted ${i} users`);
            }
        }
        console.log('Inserted 1000 users successfully');
    } catch (err) {
        console.error('Error inserting users: ', err);
    } finally {
        await pool.end();
    }
}

insertUsers();