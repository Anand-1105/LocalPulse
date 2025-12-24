const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 1. Discover Places - All Businesses with Category Name
app.get('/api/businesses', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT b.*, c.name as category_name, c.slug as category_slug
      FROM businesses b 
      LEFT JOIN categories c ON b.category_id = c.id
      ORDER BY b.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error fetching businesses' });
  }
});

// 2. Browse Collections - All Categories
app.get('/api/categories', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM categories ORDER BY name ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error fetching categories' });
  }
});

// 3. View Collection - Businesses by Category Slug
app.get('/api/categories/:slug/businesses', async (req, res) => {
  try {
    const { slug } = req.params;
    const result = await db.query(`
      SELECT b.*, c.name as category_name
      FROM businesses b 
      JOIN categories c ON b.category_id = c.id
      WHERE c.slug = $1
      ORDER BY b.rating DESC
    `, [slug]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error fetching businesses by category' });
  }
});

// 4. Top Rated
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

// 5. Single Business Detail with full Gallery
app.get('/api/businesses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const bizResult = await db.query(`
      SELECT b.*, c.name as category_name
      FROM businesses b 
      LEFT JOIN categories c ON b.category_id = c.id
      WHERE b.id = $1
    `, [id]);
    
    if (bizResult.rows.length === 0) {
      return res.status(404).json({ error: 'Business not found' });
    }

    const imgResult = await db.query('SELECT image_url FROM business_images WHERE business_id = $1', [id]);
    
    const business = bizResult.rows[0];
    const gallery = imgResult.rows.map(r => r.image_url);
    
    // Combine primary image with gallery
    business.images = gallery.length > 0 ? [business.image_url, ...gallery] : [business.image_url];
    
    res.json(business);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error fetching business details' });
  }
});

app.listen(PORT, () => {
  console.log(`Pulse Server operational at http://localhost:${PORT}`);
});