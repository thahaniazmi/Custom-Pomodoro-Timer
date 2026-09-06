// Cloudflare Worker API & Static Asset Server for Flowstate Pomodoro with D1 & Resend

// Helper: PBKDF2 Password Hashing with Salt via Web Crypto API
async function hashPassword(password, salt) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );
  const key = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: enc.encode(salt),
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    256
  );
  return Array.from(new Uint8Array(key))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Helper: Send Branded Verification Code via Resend
async function sendResendOtpEmail(apiKey, toEmail, username, code, purpose) {
  const isReset = purpose === 'reset_password';
  const title = isReset ? 'Password Reset Verification' : 'Welcome to Flowstate';
  const desc = isReset
    ? 'Use the 6-digit confirmation code below to reset your Flowstate password:'
    : 'Use the 6-digit confirmation code below to verify your email and activate your synchronized account:';

  return fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: 'Flowstate Pomodoro <onboarding@resend.dev>',
      to: toEmail,
      subject: `Your Flowstate Verification Code: ${code}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 28px; background: #0f1117; color: #f3f4f6; border-radius: 16px; border: 1px solid #2d3348;">
          <div style="text-align: center; margin-bottom: 20px;">
            <span style="font-size: 36px;">🍅</span>
            <h2 style="margin: 8px 0 4px; color: #c084fc; font-size: 22px; font-weight: 700;">Flowstate Pomodoro</h2>
            <p style="margin: 0; color: #94a3b8; font-size: 13px;">${title}</p>
          </div>
          <p style="font-size: 14px; color: #cbd5e1; line-height: 1.5; margin-bottom: 20px;">
            Hello <strong>${username || 'Scholar'}</strong>,
          </p>
          <p style="font-size: 14px; color: #94a3b8; line-height: 1.5; margin-bottom: 24px;">
            ${desc}
          </p>
          <div style="background: rgba(192, 132, 252, 0.08); border: 2px dashed #a855f7; border-radius: 12px; padding: 18px; text-align: center; margin-bottom: 24px;">
            <span style="font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #f3e8ff; font-family: 'SF Mono', Monaco, Consolas, monospace;">${code}</span>
          </div>
          <p style="font-size: 12px; color: #64748b; line-height: 1.4; margin: 0; text-align: center;">
            This code expires in 10 minutes. If you didn't request this code, you can safely ignore this email.
          </p>
        </div>
      `
    })
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Set CORS headers for all API responses
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Content-Type': 'application/json'
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const apiKey = env && env.RESEND_API_KEY;
    const db = (env && (env.DB || env.pomodoro_db)); // Cloudflare D1 Binding

    // 1. Send OTP for Sign Up
    if (request.method === 'POST' && url.pathname === '/api/send-otp') {
      try {
        const body = await request.json();
        const { email, username, code } = body;

        if (!email || !code) {
          return new Response(JSON.stringify({ error: 'Missing email or verification code' }), { status: 400, headers: corsHeaders });
        }

        if (!apiKey) {
          return new Response(JSON.stringify({ error: 'RESEND_API_KEY is not configured in Cloudflare environment variables.' }), { status: 500, headers: corsHeaders });
        }

        // Store OTP in D1 if database is linked
        if (db) {
          await db.prepare(`
            INSERT INTO otp_codes (email, code, purpose, expires_at)
            VALUES (?, ?, 'signup', ?)
            ON CONFLICT(email) DO UPDATE SET code = excluded.code, purpose = excluded.purpose, expires_at = excluded.expires_at
          `).bind(email.toLowerCase(), code, Date.now() + 10 * 60 * 1000).run();
        }

        const resendRes = await sendResendOtpEmail(apiKey, email, username, code, 'signup');
        const data = await resendRes.json();
        if (!resendRes.ok) {
          return new Response(JSON.stringify({ error: data.message || 'Failed to dispatch email via Resend' }), { status: resendRes.status, headers: corsHeaders });
        }

        return new Response(JSON.stringify({ success: true, id: data.id }), { status: 200, headers: corsHeaders });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
      }
    }

    // 2. Complete Sign Up with Verified OTP into D1
    if (request.method === 'POST' && url.pathname === '/api/auth/register') {
      if (!db) {
        return new Response(JSON.stringify({ error: 'Cloudflare D1 is not bound yet. Please configure DB in wrangler.json.' }), { status: 500, headers: corsHeaders });
      }

      try {
        const { username, email, password, code, country, flag } = await request.json();
        if (!username || !email || !password || !code) {
          return new Response(JSON.stringify({ error: 'All fields are required.' }), { status: 400, headers: corsHeaders });
        }

        // Verify OTP
        const otpRecord = await db.prepare('SELECT * FROM otp_codes WHERE email = ? AND purpose = ?').bind(email.toLowerCase(), 'signup').first();
        if (!otpRecord || otpRecord.code !== code || Date.now() > otpRecord.expires_at) {
          return new Response(JSON.stringify({ error: 'Invalid or expired verification code.' }), { status: 400, headers: corsHeaders });
        }

        // Check if username or email is already taken
        const existing = await db.prepare('SELECT id FROM users WHERE username = ? OR email = ?').bind(username, email.toLowerCase()).first();
        if (existing) {
          return new Response(JSON.stringify({ error: 'Username or Email is already registered.' }), { status: 409, headers: corsHeaders });
        }

        // Hash password securely with salt
        const salt = crypto.randomUUID();
        const passwordHash = await hashPassword(password, salt);
        const userId = crypto.randomUUID();

        // Save User & Init Stats in D1
        await db.batch([
          db.prepare(`
            INSERT INTO users (id, username, email, password_hash, salt, country, flag, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `).bind(userId, username, email.toLowerCase(), passwordHash, salt, country || 'United States', flag || '🇺🇸', Date.now()),
          db.prepare(`
            INSERT INTO user_stats (user_id, daily_secs, weekly_secs, alltime_secs, streak_days, updated_at)
            VALUES (?, 0, 0, 0, 1, ?)
          `).bind(userId, Date.now()),
          db.prepare('DELETE FROM otp_codes WHERE email = ?').bind(email.toLowerCase())
        ]);

        return new Response(JSON.stringify({
          success: true,
          user: { id: userId, username, email: email.toLowerCase(), country: country || 'United States', flag: flag || '🇺🇸' }
        }), { status: 201, headers: corsHeaders });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
      }
    }

    // 3. Login with Username/Email & Password from D1
    if (request.method === 'POST' && url.pathname === '/api/auth/login') {
      if (!db) {
        return new Response(JSON.stringify({ error: 'Cloudflare D1 is not bound yet.' }), { status: 500, headers: corsHeaders });
      }

      try {
        const { identifier, password } = await request.json();
        if (!identifier || !password) {
          return new Response(JSON.stringify({ error: 'Username/Email and Password are required.' }), { status: 400, headers: corsHeaders });
        }

        const user = await db.prepare('SELECT * FROM users WHERE username = ? OR email = ?').bind(identifier, identifier.toLowerCase()).first();
        if (!user) {
          return new Response(JSON.stringify({ error: 'Invalid credentials. User not found.' }), { status: 401, headers: corsHeaders });
        }

        const computedHash = await hashPassword(password, user.salt);
        if (computedHash !== user.password_hash) {
          return new Response(JSON.stringify({ error: 'Incorrect password. Please try again.' }), { status: 401, headers: corsHeaders });
        }

        const stats = await db.prepare('SELECT * FROM user_stats WHERE user_id = ?').bind(user.id).first();

        return new Response(JSON.stringify({
          success: true,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            country: user.country,
            flag: user.flag,
            isAnonymous: Boolean(user.is_anonymous)
          },
          stats: stats || { daily_secs: 0, weekly_secs: 0, alltime_secs: 0, streak_days: 1 }
        }), { status: 200, headers: corsHeaders });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
      }
    }

    // 4. Request Password Reset OTP
    if (request.method === 'POST' && url.pathname === '/api/auth/forgot-password-otp') {
      if (!db || !apiKey) {
        return new Response(JSON.stringify({ error: 'Service configuration incomplete.' }), { status: 500, headers: corsHeaders });
      }

      try {
        const { email } = await request.json();
        if (!email) {
          return new Response(JSON.stringify({ error: 'Email address is required.' }), { status: 400, headers: corsHeaders });
        }

        const user = await db.prepare('SELECT * FROM users WHERE email = ?').bind(email.toLowerCase()).first();
        if (!user) {
          return new Response(JSON.stringify({ error: 'No account found with this email address.' }), { status: 404, headers: corsHeaders });
        }

        const code = Math.floor(100000 + Math.random() * 900000).toString();
        await db.prepare(`
          INSERT INTO otp_codes (email, code, purpose, expires_at)
          VALUES (?, ?, 'reset_password', ?)
          ON CONFLICT(email) DO UPDATE SET code = excluded.code, purpose = excluded.purpose, expires_at = excluded.expires_at
        `).bind(email.toLowerCase(), code, Date.now() + 10 * 60 * 1000).run();

        const resendRes = await sendResendOtpEmail(apiKey, email, user.username, code, 'reset_password');
        if (!resendRes.ok) {
          const errData = await resendRes.json();
          return new Response(JSON.stringify({ error: errData.message || 'Failed to dispatch email' }), { status: resendRes.status, headers: corsHeaders });
        }

        return new Response(JSON.stringify({ success: true, message: 'Password reset code dispatched!' }), { status: 200, headers: corsHeaders });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
      }
    }

    // 5. Complete Password Reset
    if (request.method === 'POST' && url.pathname === '/api/auth/reset-password') {
      if (!db) {
        return new Response(JSON.stringify({ error: 'Cloudflare D1 is not bound yet.' }), { status: 500, headers: corsHeaders });
      }

      try {
        const { email, code, newPassword } = await request.json();
        if (!email || !code || !newPassword || newPassword.length < 6) {
          return new Response(JSON.stringify({ error: 'Valid email, OTP code, and new password (min 6 chars) required.' }), { status: 400, headers: corsHeaders });
        }

        const otpRecord = await db.prepare('SELECT * FROM otp_codes WHERE email = ? AND purpose = ?').bind(email.toLowerCase(), 'reset_password').first();
        if (!otpRecord || otpRecord.code !== code || Date.now() > otpRecord.expires_at) {
          return new Response(JSON.stringify({ error: 'Invalid or expired reset code.' }), { status: 400, headers: corsHeaders });
        }

        const newSalt = crypto.randomUUID();
        const newHash = await hashPassword(newPassword, newSalt);

        await db.batch([
          db.prepare('UPDATE users SET password_hash = ?, salt = ? WHERE email = ?').bind(newHash, newSalt, email.toLowerCase()),
          db.prepare('DELETE FROM otp_codes WHERE email = ?').bind(email.toLowerCase())
        ]);

        return new Response(JSON.stringify({ success: true, message: 'Password updated successfully. You can now sign in!' }), { status: 200, headers: corsHeaders });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
      }
    }

    // 6. Sync User Focus Stats to D1
    if (request.method === 'POST' && url.pathname === '/api/sync') {
      if (!db) {
        return new Response(JSON.stringify({ error: 'Cloudflare D1 is not bound yet.' }), { status: 500, headers: corsHeaders });
      }

      try {
        const { userId, dailySecs, weeklySecs, alltimeSecs, streakDays, lastDate } = await request.json();
        if (!userId) {
          return new Response(JSON.stringify({ error: 'User ID is required to sync.' }), { status: 400, headers: corsHeaders });
        }

        await db.prepare(`
          INSERT INTO user_stats (user_id, daily_secs, weekly_secs, alltime_secs, streak_days, last_active_date, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(user_id) DO UPDATE SET
            daily_secs = excluded.daily_secs,
            weekly_secs = excluded.weekly_secs,
            alltime_secs = excluded.alltime_secs,
            streak_days = excluded.streak_days,
            last_active_date = excluded.last_active_date,
            updated_at = excluded.updated_at
        `).bind(userId, dailySecs || 0, weeklySecs || 0, alltimeSecs || 0, streakDays || 1, lastDate || '', Date.now()).run();

        return new Response(JSON.stringify({ success: true, syncedAt: Date.now() }), { status: 200, headers: corsHeaders });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
      }
    }

    // 7. Get Live Leaderboard from D1
    if (request.method === 'GET' && url.pathname === '/api/leaderboard') {
      if (!db) {
        return new Response(JSON.stringify({ leaderboard: [] }), { status: 200, headers: corsHeaders });
      }

      try {
        const period = url.searchParams.get('period') || 'daily';
        const orderColumn = period === 'weekly' ? 's.weekly_secs' : period === 'alltime' ? 's.alltime_secs' : 's.daily_secs';

        const rows = await db.prepare(`
          SELECT 
            u.id,
            CASE WHEN u.is_anonymous = 1 THEN 'Anonymous' ELSE u.username END as name,
            CASE WHEN u.is_anonymous = 1 THEN '🌐' ELSE u.flag END as flag,
            CASE WHEN u.is_anonymous = 1 THEN 'Anonymous' ELSE u.country END as country,
            s.daily_secs as daily,
            s.weekly_secs as weekly,
            s.alltime_secs as alltime,
            s.streak_days as streak
          FROM user_stats s
          JOIN users u ON s.user_id = u.id
          WHERE ${orderColumn} > 0
          ORDER BY ${orderColumn} DESC
          LIMIT 50
        `).all();

        return new Response(JSON.stringify({ leaderboard: rows.results || [] }), { status: 200, headers: corsHeaders });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
      }
    }

    // Fallback: Static Assets
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return new Response('Not Found', { status: 404 });
  }
};
