// Zero-dependency local Node.js server for Flowstate Pomodoro with Resend Email OTP API
const http = require('http');
const fs = require('fs');
const path = require('path');

// Auto-load .env file if present
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split(/\r?\n/).forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const k = trimmed.slice(0, idx).trim();
        const v = trimmed.slice(idx + 1).trim();
        if (!process.env[k]) process.env[k] = v;
      }
    }
  });
}

const PORT = process.env.PORT || 3000;
const RESEND_API_KEY = process.env.RESEND_API_KEY;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg'
};

const server = http.createServer(async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // API Endpoint: Send Email OTP
  if (req.method === 'POST' && req.url === '/api/send-otp') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const { email, username, code } = JSON.parse(body || '{}');
        if (!email || !code) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Missing email or verification code' }));
          return;
        }

        if (!RESEND_API_KEY) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'RESEND_API_KEY is not configured in .env or environment variables.' }));
          return;
        }

        console.log(`[Resend] Dispatching OTP (${code}) to: ${email}...`);

        const resendResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: 'Flowstate Pomodoro <onboarding@resend.dev>',
            to: email,
            subject: `Your Flowstate Verification Code: ${code}`,
            html: `
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 28px; background: #0f1117; color: #f3f4f6; border-radius: 16px; border: 1px solid #2d3348;">
                <div style="text-align: center; margin-bottom: 20px;">
                  <span style="font-size: 36px;">🍅</span>
                  <h2 style="margin: 8px 0 4px; color: #c084fc; font-size: 22px; font-weight: 700;">Flowstate Pomodoro</h2>
                  <p style="margin: 0; color: #94a3b8; font-size: 13px;">Focus & Productivity Timer</p>
                </div>
                <p style="font-size: 14px; color: #cbd5e1; line-height: 1.5; margin-bottom: 20px;">
                  Hello <strong>${username || 'Scholar'}</strong>,
                </p>
                <p style="font-size: 14px; color: #94a3b8; line-height: 1.5; margin-bottom: 24px;">
                  Use the 6-digit confirmation code below to verify your email and activate your synchronized account:
                </p>
                <div style="background: rgba(192, 132, 252, 0.08); border: 2px dashed #a855f7; border-radius: 12px; padding: 18px; text-align: center; margin-bottom: 24px;">
                  <span style="font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #f3e8ff; font-family: 'SF Mono', Monaco, Consolas, monospace;">${code}</span>
                </div>
                <p style="font-size: 12px; color: #64748b; line-height: 1.4; margin: 0; text-align: center;">
                  This code will expire in 10 minutes. If you didn't request this code, you can safely ignore this email.
                </p>
              </div>
            `
          })
        });

        const data = await resendResponse.json();
        if (!resendResponse.ok) {
          console.warn(`[Resend Error] Status ${resendResponse.status}:`, data);
          res.writeHead(resendResponse.status, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: data.message || 'Failed to send email via Resend' }));
          return;
        }

        console.log(`[Resend Success] Email delivered. Message ID:`, data.id);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, id: data.id }));
      } catch (err) {
        console.error('[Server Error]:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message || 'Internal server error' }));
      }
    });
    return;
  }

  // Local Dev In-Memory Leaderboard & Sync Handlers
  if (req.method === 'POST' && req.url === '/api/sync') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, syncedAt: Date.now() }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
    return;
  }

  if (req.method === 'GET' && req.url.startsWith('/api/leaderboard')) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ leaderboard: [] }));
    return;
  }

  // Static File Serving
  let reqPath = decodeURIComponent(req.url.split('?')[0]);
  if (reqPath === '/' || reqPath === '') {
    reqPath = '/index.html';
  }

  const safePath = path.normalize(path.join(__dirname, reqPath));
  if (!safePath.startsWith(__dirname)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.stat(safePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(safePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(safePath).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🍅 Flowstate Pomodoro Server is running!`);
  console.log(`🌐 Local URL:   http://localhost:${PORT}`);
  console.log(`✉️  Resend API:  ${RESEND_API_KEY ? 'Configured from .env / environment' : 'Not configured (set in .env)'}`);
  console.log(`====================================================`);
});
