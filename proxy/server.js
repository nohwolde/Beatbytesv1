const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const fetch = require('node-fetch');
const cors = require('cors');
const get_middleware = require("@warren-bank/hls-proxy/hls-proxy/proxy");

const app = express();
const port = 8080;

// Enable CORS for all routes
app.use(cors({
  origin: true, // Reflect the request origin in the Access-Control-Allow-Origin header
  credentials: true, // Allow cookies to be included in the request
}));

app.options('*', (req, res) => {
  // Set CORS headers
  res.header('Access-Control-Allow-Origin', req.headers['origin'] || '*');
  res.header('Access-Control-Allow-Headers', '*');
  res.header('Access-Control-Allow-Methods', '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Respond with 200
  res.sendStatus(200);
});

function copyHeader(name, source, target) {
  const value = source[name];
  if (value) {
    target[name] = value;
  }
}

// // Middleware to check for __host in the query string
// app.use((req, res , next) => {
//   const url = new URL(req.url, `http://localhost:${port}`);
//   if (!url.searchParams.has('__host')) {
//     res.status(400).send('Request is formatted incorrectly. Please include __host in the query string.');
//   } else {
//     next();
//   }
// });

// Proxy for SoundCloud API
app.use('/api', createProxyMiddleware({
  target: 'https://api.soundcloud.com',
  changeOrigin: true,
  onProxyRes: (proxyRes, req, res) => {
    // Add custom headers to response
    proxyRes.headers['Access-Control-Allow-Origin'] = req.headers.origin || '*';
    proxyRes.headers['Access-Control-Allow-Methods'] = '*';
    proxyRes.headers['Access-Control-Allow-Headers'] = 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-goog-visitor-id, x-origin, x-youtube-client-version, Accept-Language, Range, Referer';
    proxyRes.headers['Access-Control-Max-Age'] = '86400';
    proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';
  }
}));


app.use('/hls', (req, res, next) => {
  const middleware = get_middleware({
    cache_segments: true,
    acl_ip: ['127.0.0.1']
  });

  middleware.connection(req, res, next);
  middleware.request(req, res, next);
});

// // Proxy for HLS content
// app.use('/hls', createProxyMiddleware({
//   target: 'https://cf-hls-media.sndcdn.com',
//   changeOrigin: true,
//   onProxyRes: (proxyRes, req, res) => {
//     // Add custom headers to response
//     proxyRes.headers['Access-Control-Allow-Origin'] = req.headers.origin || '*';
//     proxyRes.headers['Access-Control-Allow-Methods'] = '*';
//     proxyRes.headers['Access-Control-Allow-Headers'] = 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-goog-visitor-id, x-origin, x-youtube-client-version, Accept-Language, Range, Referer';
//     proxyRes.headers['Access-Control-Max-Age'] = '86400';
//     proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';
//   }
// }));

// Handler for YouTube requests
app.use('/', async (req, res) => {

  const url = new URL(req.url, `http://localhost/`);
  if (!url.searchParams.has('__host')) {
    return new Response(
      'Request is formatted incorrectly. Please include __host in the query string.',
      { status: 400 },
    );
  }

  // Set the URL host to the __host parameter
  url.host = url.searchParams.get('__host');

  
  url.protocol = 'https';
  url.port = '443';
  url.searchParams.delete('__host');

  // Copy headers from the request to the new request
  const request_headers = new Headers(JSON.parse(url.searchParams.get('__headers') || '{}'))

  copyHeader('range', request_headers, req.headers);
  !request_headers.has('user-agent') && copyHeader('user-agent', request_headers, req.headers);
  url.searchParams.delete('__headers');

  // Make the request to YouTube
  const fetchRes = await fetch(url, {
    method: req.method,
    headers: request_headers,
    body: req.body,
  });

  // Convert fetchRes.headers to a plain JavaScript object
  const fetchResHeaders = {};
  for (let [key, value] of fetchRes.headers.entries()) {
    fetchResHeaders[key] = value;
  }

  // Construct the return headers
  const headers = {};

  // copy content headers
  ['content-length', 'content-type', 'content-disposition', 'accept-ranges', 'content-range'].forEach(header => {
    copyHeader(header, headers, fetchRes.headers);
  });

  // add cors headers
  headers['Access-Control-Allow-Origin'] = req.headers['origin'] || '*';
  headers['Access-Control-Allow-Headers'] = '*';
  headers['Access-Control-Allow-Methods'] = '*';
  headers['Access-Control-Allow-Credentials'] = 'true';

  // Get the response body as text
  const body = await fetchRes.text();

  // Send the response
  res.status(fetchRes.status).set(headers).send(body);

});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});