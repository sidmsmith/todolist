const express = require('express');
const path = require('path');
const fetch = require('node-fetch');

const app = express();
app.use(express.json({ limit: '50mb' }));

// Serve static files from the React app build
app.use(express.static(path.join(__dirname, 'frontend/dist')));

// Proxy API calls to backend
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

app.use('/api/*', async (req, res) => {
  try {
    const apiPath = req.originalUrl.replace('/api', '');
    const url = `${BACKEND_URL}${apiPath}`;
    
    const options = {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        ...req.headers
      }
    };

    if (req.method !== 'GET' && req.body) {
      options.body = JSON.stringify(req.body);
    }

    const response = await fetch(url, options);
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    console.error('Proxy error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/dist/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📋 Proxying API calls to: ${BACKEND_URL}`);
});
