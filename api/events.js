export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const API_JWT_BYPASS = process.env.API_JWT_BYPASS;

  if (!API_JWT_BYPASS) {
    res.status(500).json({ error: 'API_JWT_BYPASS environment variable not configured' });
    return;
  }

  try {
    const response = await fetch(
      'https://c-api.sporfie.com/v3/events-discovery?page=0&scope=default',
      {
        headers: {
          'x-jwt': API_JWT_BYPASS,
          'Referer': 'https://www.sporfie.com',
        },
      }
    );

    if (!response.ok) {
      res.status(response.status).json({ 
        error: `Upstream API error: ${response.statusText}` 
      });
      return;
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
}

