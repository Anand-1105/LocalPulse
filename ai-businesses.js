const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// AI call stub - replace with actual AI service
async function callAIForBusinesses(category, city) {
  // This would call your AI service (OpenAI, Claude, etc.)
  // For now, returning mock structured data
  const prompt = `Generate 5 real ${category} businesses in ${city}. Return ONLY valid JSON array with exact fields: name, category, type, city, rating, latitude, longitude. No explanations.`;
  
  // Mock AI response - replace with actual AI call
  return [
    {
      name: `${city} ${category} Place`,
      category: category,
      type: "commercial",
      city: city,
      rating: 4.2,
      latitude: 31.2244,
      longitude: 75.7722
    }
  ];
}

// Validation schema
function validateBusiness(business) {
  const required = ['name', 'category', 'type', 'city', 'rating', 'latitude', 'longitude'];
  
  for (const field of required) {
    if (!business[field]) return false;
  }
  
  if (typeof business.rating !== 'number' || business.rating < 0 || business.rating > 5) return false;
  if (typeof business.latitude !== 'number' || typeof business.longitude !== 'number') return false;
  
  return true;
}

// GET /api/businesses with AI fallback
router.get('/', async (req, res) => {
  try {
    const { category, city } = req.query;
    
    if (!category || !city) {
      return res.status(400).json({ error: 'Category and city required' });
    }

    // 1. Check database first
    const { data: existingBusinesses, error: dbError } = await supabase
      .from('businesses')
      .select('*')
      .eq('category', category)
      .eq('city', city);

    if (dbError) throw dbError;

    // 2. If businesses exist, return them
    if (existingBusinesses && existingBusinesses.length > 0) {
      return res.json(existingBusinesses);
    }

    // 3. Check if we've already tried AI for this search
    const { data: searchCache } = await supabase
      .from('search_cache')
      .select('*')
      .eq('category', category)
      .eq('city', city)
      .single();

    // If cached within last hour, return empty (avoid repeated AI calls)
    if (searchCache && new Date() - new Date(searchCache.last_populated) < 3600000) {
      return res.json([]);
    }

    // 4. Call AI for suggestions
    console.log(`No businesses found for ${category} in ${city}, calling AI...`);
    const aiSuggestions = await callAIForBusinesses(category, city);

    // 5. Validate and store AI suggestions
    const validBusinesses = [];
    for (const business of aiSuggestions) {
      if (validateBusiness(business)) {
        const { data: inserted } = await supabase
          .from('businesses')
          .insert({
            ...business,
            ai_generated: true
          })
          .select()
          .single();
        
        if (inserted) validBusinesses.push(inserted);
      }
    }

    // 6. Update search cache
    await supabase
      .from('search_cache')
      .upsert({
        category,
        city,
        last_populated: new Date().toISOString()
      });

    // 7. Return stored results
    res.json(validBusinesses);

  } catch (error) {
    console.error('Business search error:', error);
    res.status(500).json({ error: 'Failed to fetch businesses' });
  }
});

module.exports = router;