const express = require('express');
const cors = require('cors');
const db = require('./db');
const aiBusinessesRouter = require('./ai-businesses');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// AI-assisted business search (checks DB first, AI fallback)
app.use('/api/businesses', aiBusinessesRouter);

// Legacy routes
app.get('/api/categories', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM categories ORDER BY name ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error fetching categories' });
  }
});

app.get('/api/businesses/top-rated', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT b.*, c.name as category_name
      FROM businesses b 
      LEFT JOIN categories c ON b.category_id = c.id
      ORDER BY b.rating DESC 
      LIMIT 12
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error fetching top rated businesses' });
  }
});

app.listen(PORT, () => {
  console.log(`AI-Assisted Business Server running on port ${PORT}`);
});