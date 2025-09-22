import express from 'express';
import fetch from 'node-fetch';

const app = express();
const PORT = process.env.PORT || 3001;

app.get('/api/statistics/:year', async (req, res) => {
  const { year } = req.params;
  const apiUrl = `https://f1fantasytools.com/api/statistics/${year}`;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 300000); // 5 minutes
    const response = await fetch(apiUrl, { signal: controller.signal });
    clearTimeout(timeout);
    const data = await response.text();
    res.set('Content-Type', response.headers.get('content-type') || 'application/json');
    res.status(response.status).send(data);
  } catch (error) {
    res.status(500).json({ error: 'Proxy error', details: error.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Proxy server running on http://0.0.0.0:${PORT}`);
});
