const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Static Files Data (Replacing SQLite)
const FILES_DATA = [
  { filename: 'faith.pdf', display_name: 'Faith Document', visit_count: 0 },
  { filename: 'monicah.pdf', display_name: 'Eulogy For Monicah', visit_count: 9 },
  { filename: 'james.pdf', display_name: 'Eulogy For James', visit_count: 0 }
];

// Dashboard HTML
function renderDashboard(files) {
  const totalDownloads = files.reduce((sum, f) => sum + f.visit_count, 0);

  const cards = files.map(file => `
    <div class="card">
      <div class="card-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      </div>
      <div class="card-body">
        <h3 class="card-title">${file.display_name}</h3>
        <p class="card-filename">${file.filename}</p>
        <div class="card-meta">
          <span class="badge">
            <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
              <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z"/>
              <path fill-rule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"/>
            </svg>
            ${file.visit_count.toLocaleString()} Visit${file.visit_count !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
      <div class="card-actions">
        <a href="/${file.filename}" class="btn-primary">
          <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
            <path d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.235a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.955 3.129V2.75z"/>
            <path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z"/>
          </svg>
          Open
        </a>
        <button class="btn-secondary copy-btn" data-url="${file.filename}">
          <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
            <path d="M7 3.5A1.5 1.5 0 018.5 2h3.879a1.5 1.5 0 011.06.44l3.122 3.12A1.5 1.5 0 0117 6.622V12.5a1.5 1.5 0 01-1.5 1.5h-1v-3.379a3 3 0 00-.879-2.121L10.5 5.379A3 3 0 008.379 4.5H7v-1z"/>
            <path d="M4.5 6A1.5 1.5 0 003 7.5v9A1.5 1.5 0 004.5 18h7a1.5 1.5 0 001.5-1.5v-5.879a1.5 1.5 0 00-.44-1.06L9.44 6.439A1.5 1.5 0 008.378 6H4.5z"/>
          </svg>
          <span>Copy Link</span>
        </button>
      </div>
    </div>
  `).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Whizpoint Solutions — File Hub</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --primary: #0f172a;
      --accent: #3b82f6;
      --bg: #f8fafc;
      --surface: #ffffff;
      --text: #0f172a;
      --text-muted: #64748b;
    }

    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
      background: var(--bg);
      color: var(--text);
      min-height: 100vh;
      -webkit-font-smoothing: antialiased;
    }

    .header {
      background: rgba(255, 255, 255, 0.8);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid rgba(0,0,0,0.05);
      position: sticky; top: 0; z-index: 100;
    }
    .header-inner {
      max-width: 1200px; margin: 0 auto; padding: 0 24px;
      display: flex; align-items: center; justify-content: space-between; height: 72px;
    }
    .logo { display: flex; align-items: center; gap: 12px; text-decoration: none; }
    .logo-icon {
      width: 40px; height: 40px; background: var(--primary);
      border-radius: 12px; display: flex; align-items: center; justify-content: center;
      color: white;
    }
    .logo-text { font-size: 20px; font-weight: 700; color: var(--text); letter-spacing: -0.5px; }
    
    .hero {
      max-width: 1200px; margin: 0 auto; padding: 80px 24px 60px;
      text-align: center;
    }
    .hero h1 { font-size: clamp(32px, 5vw, 56px); font-weight: 700; letter-spacing: -1.5px; line-height: 1.1; }
    .hero p { margin-top: 16px; color: var(--text-muted); font-size: 18px; max-width: 500px; margin-inline: auto; }

    .content { max-width: 1200px; margin: 0 auto; padding: 0 24px 100px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 24px; }

    .card {
      background: var(--surface); border-radius: 20px;
      border: 1px solid rgba(0,0,0,0.08); overflow: hidden;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }
    .card:hover { transform: translateY(-4px); box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); border-color: rgba(0,0,0,0.12); }
    .card-icon {
      background: #f1f5f9; padding: 32px 24px;
      display: flex; align-items: center; justify-content: center;
    }
    .card-icon svg { width: 48px; height: 48px; color: var(--primary); }
    .card-body { padding: 24px; }
    .card-title { font-size: 18px; font-weight: 700; letter-spacing: -0.5px; }
    .card-filename { font-size: 14px; color: var(--text-muted); margin-top: 4px; font-family: ui-monospace, monospace; }
    .card-meta { margin-top: 16px; }
    .badge {
      display: inline-flex; align-items: center; gap: 6px;
      background: #f1f5f9; color: var(--text);
      padding: 6px 12px; border-radius: 20px; font-size: 13px; font-weight: 600;
    }
    .card-actions { padding: 0 24px 24px; display: flex; gap: 12px; }
    .btn-primary, .btn-secondary {
      flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px;
      padding: 12px; border-radius: 12px; font-size: 14px; font-weight: 600; cursor: pointer;
      text-decoration: none; transition: all 0.2s; border: none;
    }
    .btn-primary { background: var(--primary); color: white; }
    .btn-primary:hover { background: #1e293b; }
    .btn-secondary { background: white; color: var(--text); border: 1px solid #e2e8f0; }
    .btn-secondary:hover { background: #f8fafc; }
    .btn-secondary.copied { background: #10b981; color: white; border-color: #10b981; }

    @media (max-width: 640px) {
      .hero { padding: 60px 24px 40px; }
      .grid { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>

<header class="header">
  <div class="header-inner">
    <a href="/" class="logo">
      <div class="logo-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776" />
        </svg>
      </div>
      <span class="logo-text">Whizpoint Solutions</span>
    </a>
  </div>
</header>

<section class="hero">
  <h1>Secure File Hub</h1>
  <p>Fast, reliable document sharing for Whizpoint Solutions clients.</p>
</section>

<main class="content">
  <div class="grid">
    ${cards}
  </div>
</main>

<script>
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const url = window.location.origin + '/' + btn.dataset.url;
      try {
        await navigator.clipboard.writeText(url);
      } catch {
        const ta = document.createElement('textarea');
        ta.value = url;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      const span = btn.querySelector('span');
      const orig = span.textContent;
      span.textContent = 'Copied!';
      btn.classList.add('copied');
      setTimeout(() => { span.textContent = orig; btn.classList.remove('copied'); }, 2000);
    });
  });
</script>
</body>
</html>`;
}

// Ultra-Modern Minimalist Interstitial Splash HTML
function renderSplash(filename, displayName) {
  const fileUrl = 'https://qr.whizpoint.app/' + filename;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Opening File — Whizpoint Solutions</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    
    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
      background: #0f172a;
      background-image: radial-gradient(circle at 50% 0%, #1e293b 0%, #0f172a 70%);
      min-height: 100vh;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      padding: 24px; color: white;
      -webkit-font-smoothing: antialiased;
    }

    .glass-card {
      background: rgba(255, 255, 255, 0.03);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 24px;
      padding: 48px 32px;
      max-width: 440px;
      width: 100%;
      text-align: center;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    }

    .brand { font-size: 18px; font-weight: 700; letter-spacing: -0.5px; margin-bottom: 32px; color: #f8fafc; opacity: 0.9; }

    .timer-wrap { margin-bottom: 24px; }
    .timer-num { 
      font-size: 64px; font-weight: 700; line-height: 1;
      background: linear-gradient(135deg, #60a5fa, #a78bfa);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .timer-label { font-size: 14px; font-weight: 500; color: #94a3b8; text-transform: uppercase; letter-spacing: 2px; margin-top: 4px; }

    .info-text { font-size: 16px; color: #cbd5e1; margin-bottom: 24px; font-weight: 500; }
    
    .context-box {
      background: rgba(0, 0, 0, 0.2);
      border-radius: 12px; padding: 16px;
      margin-bottom: 24px; font-size: 14px; color: #94a3b8; line-height: 1.6;
    }
    .context-box strong { color: white; font-weight: 600; font-size: 15px; }
    .context-link { color: #60a5fa; text-decoration: none; word-break: break-all; display: block; margin-top: 4px; }

    .wait-text { font-size: 14px; color: #64748b; margin-bottom: 32px; }

    .btn-skip {
      display: block; width: 100%;
      background: white; color: #0f172a;
      padding: 14px 24px; border-radius: 12px;
      font-size: 15px; font-weight: 600; text-decoration: none;
      transition: transform 0.2s, background 0.2s;
      margin-bottom: 16px;
    }
    .btn-skip:hover { background: #f8fafc; transform: scale(0.98); }

    .phone-link {
      display: inline-block; font-size: 15px; font-weight: 600;
      color: #34d399; text-decoration: none; padding: 8px;
      transition: opacity 0.2s;
    }
    .phone-link:hover { opacity: 0.8; }

  </style>
</head>
<body>

<div class="glass-card">
  <div class="brand">Whizpoint Solutions</div>
  
  <div class="timer-wrap">
    <div class="timer-num" id="countdown">3</div>
    <div class="timer-label">sec</div>
  </div>

  <div class="info-text">The file is being prepared...</div>

  <div class="context-box">
    You are about to visit <strong>${displayName}</strong> from<br>
    <a href="${fileUrl}" class="context-link">${fileUrl}</a>
  </div>

  <div class="wait-text">Please wait while we load your file</div>

  <a href="/${filename}?download=true" class="btn-skip">Download Now (skip countdown)</a>
  <a href="tel:0740841168" class="phone-link">Tell 0740 841 168</a>
</div>

<script>
  let remaining = 3; // Strictly set to 3 seconds
  const countEl = document.getElementById('countdown');
  const redirectUrl = '/${filename}?download=true';

  function tick() {
    remaining--;
    countEl.textContent = remaining;
    if (remaining <= 0) {
      window.location.href = redirectUrl;
    } else {
      setTimeout(tick, 1000);
    }
  }
  
  // Start countdown
  setTimeout(tick, 1000);
</script>
</body>
</html>`;
}

// Dashboard route
app.get('/', (req, res) => {
  res.send(renderDashboard(FILES_DATA));
});

// PDF interceptor & streaming serve route
app.get('/:filename', (req, res) => {
  const { filename } = req.params;

  if (!filename.toLowerCase().endsWith('.pdf')) {
    return res.status(404).send('Not found');
  }

  const filePath = path.join(__dirname, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).send('File not found');
  }

  if (req.query.download === 'true') {
    // Increment visit count locally in memory
    const fileRecord = FILES_DATA.find(f => f.filename === filename);
    if (fileRecord) {
      fileRecord.visit_count += 1;
    }

    // Stream the PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="' + filename + '"');
    const stream = fs.createReadStream(filePath);
    stream.on('error', () => res.status(500).send('Error reading file'));
    return stream.pipe(res);
  }

  // Show minimalist 3-second splash/interstitial
  const fileRecord = FILES_DATA.find(f => f.filename === filename);
  const displayName = fileRecord?.display_name || filename.replace('.pdf', '');
  res.send(renderSplash(filename, displayName));
});

app.listen(PORT, () => {
  console.log('Server running on port ' + PORT);
});
