module.exports = async function handler(req, res) {
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

  const url = 'https://c-api.sporfie.com/v3/events-discovery?page=0&scope=default';
  const headers = {
    'x-jwt': API_JWT_BYPASS,
    'Referer': 'https://www.sporfie.com',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  };

  // Log curl equivalent for debugging
  const curlCmd = `curl -X GET '${url}' \\\n  -H 'x-jwt: ${API_JWT_BYPASS}' \\\n  -H 'Referer: https://www.sporfie.com'`;
  console.log('\n📤 Making request to upstream API:');
  console.log('─'.repeat(50));
  console.log(curlCmd);
  console.log('─'.repeat(50));

  try {
    const response = await fetch(url, { headers });

    console.log(`📥 Response status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      // Try to get more details from the response body
      let errorBody = '';
      try {
        errorBody = await response.text();
        console.log('📥 Response body:', errorBody);
      } catch (e) {}
      
      res.status(response.status).json({ 
        error: `Upstream API error: ${response.statusText}`,
        details: errorBody || undefined
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

