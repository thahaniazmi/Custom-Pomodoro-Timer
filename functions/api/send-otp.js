// Cloudflare Pages Function: POST /api/send-otp
export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const body = await request.json();
    const { email, username, code } = body;

    if (!email || !code) {
      return new Response(JSON.stringify({ error: 'Missing email or verification code' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const apiKey = (env && env.RESEND_API_KEY) || (typeof process !== 'undefined' && process.env && process.env.RESEND_API_KEY);
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'RESEND_API_KEY is not configured in Cloudflare environment variables.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
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

    const data = await resendRes.json();
    if (!resendRes.ok) {
      return new Response(JSON.stringify({ error: data.message || 'Failed to send email via Resend' }), {
        status: resendRes.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ success: true, id: data.id }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
