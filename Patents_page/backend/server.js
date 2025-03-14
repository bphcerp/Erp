const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Connect to Supabase PostgreSQL
const pool = new Pool({
    connectionString: 'postgresql://postgres.ahcdksppkqhkifcvhxcd:Patents@123@aws-0-ap-south-1.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false },
});

// Create a new patent
app.post('/patents', async (req, res) => {
    const { title, inventors, nationality, status, filing_id, filing_date, grant_date } = req.body;

    try {
        const query = `
            INSERT INTO patents (title, inventors, nationality, status, filing_id, filing_date, grant_date)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *;
        `;
        const values = [title, inventors, nationality, status, filing_id, filing_date, grant_date];
        const result = await pool.query(query, values);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get all patents
app.get('/patents', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM patents');
        res.status(200).json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
