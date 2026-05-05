const express = require('express');
const path = require('path');
const fs = require('fs');
const { DatabaseSync } = require('node:sqlite'); // <-- Using Node's native SQLite!

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Native SQLite Database
const db = new DatabaseSync('database.db');

// Create table if it doesn't exist (using .exec() instead of .run())
db.exec(`
  CREATE TABLE IF NOT EXISTS files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT UNIQUE,
    display_name TEXT,
    visit_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Seed initial data if table is empty
const rowCount = db.prepare('SELECT count(*) as count FROM files').get();
if (rowCount.count === 0) {
  const insert = db.prepare('INSERT INTO files (filename, display_name) VALUES (?, ?)');
  insert.run('faith.pdf', 'Faith Document');
  insert.run('micheal.pdf', 'Michael Portfolio');
  insert.run('james.pdf', 'Eulogy For James');
}

// ... keep the rest of your index.js code exactly as it is from here down!

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
          Open File
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
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --primary: #0066ff;
      --primary-dark: #0052cc;
      --primary-light: #e8f0fe;
      --success: #10b981;
      --neutral-50: #f8fafc;
      --neutral-100: #f1f5f9;
      --neutral-200: #e2e8f0;
      --neutral-300: #cbd5e1;
      --neutral-400: #94a3b8;
      --neutral-500: #64748b;
      --neutral-600: #475569;
      --neutral-700: #334155;
      --neutral-800: #1e293b;
      --neutral-900: #0f172a;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background: var(--neutral-50);
      color: var(--neutral-800);
      min-height: 100vh;
    }

    .header {
      background: linear-gradient(135deg, #0a1628 0%, #1a2f5a 100%);
      padding: 0 24px;
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: 0 2px 20px rgba(0,0,0,0.3);
    }
    .header-inner {
      max-width: 1100px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 64px;
    }
    .logo {
      display: flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
    }
    .logo-icon {
      width: 36px; height: 36px;
      background: var(--primary);
      border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
    }
    .logo-icon svg { color: white; }
    .logo-text { font-size: 18px; font-weight: 700; color: white; letter-spacing: -0.3px; }
    .logo-text span { color: #60a5fa; }
    .header-stat {
      background: rgba(255,255,255,0.1);
      border: 1px solid rgba(255,255,255,0.15);
      border-radius: 20px;
      padding: 6px 14px;
      display: flex; align-items: center; gap: 6px;
      color: white; font-size: 13px; font-weight: 500;
    }
    .header-stat .dot { width: 8px; height: 8px; border-radius: 50%; background: var(--success); box-shadow: 0 0 6px var(--success); }

    .hero {
      background: linear-gradient(180deg, #0a1628 0%, #0f1f42 60%, var(--neutral-50) 100%);
      padding: 56px 24px 80px;
      text-align: center;
    }
    .hero h1 {
      font-size: clamp(28px, 5vw, 48px);
      font-weight: 700; color: white; letter-spacing: -1px; line-height: 1.15;
    }
    .hero h1 span { color: #60a5fa; }
    .hero p {
      margin-top: 16px; color: #93c5fd;
      font-size: clamp(14px, 2.5vw, 17px);
      max-width: 480px; margin-left: auto; margin-right: auto; line-height: 1.6;
    }
    .hero-stats {
      margin-top: 40px;
      display: inline-flex; gap: 32px;
      background: rgba(255,255,255,0.08);
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 16px; padding: 20px 32px;
    }
    .stat-item { text-align: center; }
    .stat-num { font-size: 32px; font-weight: 700; color: white; line-height: 1; }
    .stat-label { font-size: 12px; color: #93c5fd; margin-top: 4px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; }
    .divider { width: 1px; background: rgba(255,255,255,0.15); }

    .content { max-width: 1100px; margin: -40px auto 0; padding: 0 24px 80px; }
    .section-label {
      font-size: 13px; font-weight: 600; color: var(--neutral-500);
      text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 20px;
    }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }

    .card {
      background: white; border-radius: 16px;
      border: 1px solid var(--neutral-200); overflow: hidden;
      transition: box-shadow 0.2s, transform 0.2s;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
    }
    .card:hover { box-shadow: 0 8px 30px rgba(0,0,0,0.1); transform: translateY(-2px); }
    .card-icon {
      background: linear-gradient(135deg, #eff6ff, #dbeafe);
      padding: 28px 24px 20px;
      display: flex; align-items: center; justify-content: center;
    }
    .card-icon svg { width: 52px; height: 52px; color: var(--primary); filter: drop-shadow(0 4px 8px rgba(0,102,255,0.2)); }
    .card-body { padding: 20px 20px 4px; }
    .card-title { font-size: 18px; font-weight: 700; color: var(--neutral-800); letter-spacing: -0.3px; }
    .card-filename { font-size: 13px; color: var(--neutral-400); margin-top: 4px; font-family: 'SFMono-Regular', Consolas, monospace; }
    .card-meta { margin-top: 12px; }
    .badge {
      display: inline-flex; align-items: center; gap: 5px;
      background: var(--primary-light); color: var(--primary-dark);
      padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600;
    }
    .card-actions { padding: 16px 20px 20px; display: flex; gap: 10px; }
    .btn-primary {
      flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px;
      background: var(--primary); color: white; border: none; border-radius: 10px;
      padding: 10px 16px; font-size: 14px; font-weight: 600; cursor: pointer;
      text-decoration: none; transition: background 0.15s, transform 0.1s;
    }
    .btn-primary:hover { background: var(--primary-dark); transform: scale(0.98); }
    .btn-secondary {
      display: flex; align-items: center; justify-content: center; gap: 6px;
      background: var(--neutral-100); color: var(--neutral-700);
      border: 1px solid var(--neutral-200); border-radius: 10px;
      padding: 10px 14px; font-size: 14px; font-weight: 500; cursor: pointer;
      transition: background 0.15s, transform 0.1s; white-space: nowrap;
    }
    .btn-secondary:hover { background: var(--neutral-200); transform: scale(0.98); }
    .btn-secondary.copied { background: #d1fae5; color: var(--success); border-color: #a7f3d0; }

    .footer {
      background: var(--neutral-900); color: var(--neutral-400);
      text-align: center; padding: 32px 24px; font-size: 13px; line-height: 1.6;
    }
    .footer a { color: #60a5fa; text-decoration: none; }

    @media (max-width: 640px) {
      .header-inner { height: 56px; }
      .logo-text { font-size: 16px; }
      .hero { padding: 40px 16px 64px; }
      .hero-stats { gap: 20px; padding: 16px 24px; flex-wrap: wrap; justify-content: center; }
      .divider { display: none; }
      .content { padding: 0 16px 60px; }
      .grid { grid-template-columns: 1fr; gap: 16px; }
    }
  </style>
</head>
<body>

<header class="header">
  <div class="header-inner">
    <a href="/" class="logo">
      <div class="logo-icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776" />
        </svg>
      </div>
      <span class="logo-text">Whizpoint <span>Solutions</span></span>
    </a>
    <div class="header-stat">
      <div class="dot"></div>
      ${totalDownloads.toLocaleString()} Total Downloads
    </div>
  </div>
</header>

<section class="hero">
  <h1>Secure File <span>Hosting</span><br>Made Simple</h1>
  <p>Fast, reliable document sharing for Whizpoint Solutions clients and partners.</p>
  <div class="hero-stats">
    <div class="stat-item">
      <div class="stat-num">${files.length}</div>
      <div class="stat-label">Files Hosted</div>
    </div>
    <div class="divider"></div>
    <div class="stat-item">
      <div class="stat-num">${totalDownloads.toLocaleString()}</div>
      <div class="stat-label">Total Downloads</div>
    </div>
  </div>
</section>

<main class="content">
  <p class="section-label">Hosted Documents</p>
  <div class="grid">
    ${cards}
  </div>
</main>

<footer class="footer">
  <p><strong style="color:white">Whizpoint Solutions</strong></p>
  <p style="margin-top:8px">For Cyber, iTax, or E-Citizen services — call or text <a href="tel:0740841168">0740841168</a></p>
  <p style="margin-top:8px; font-size:12px; color:#475569">© ${new Date().getFullYear()} Whizpoint Solutions. All rights reserved.</p>
</footer>

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

// Interstitial splash page HTML
function renderSplash(filename, displayName) {
  const fileUrl = 'https://qr.whizpoint.app/' + filename;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Opening ${displayName} — Whizpoint Solutions</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root { --primary: #0066ff; --primary-dark: #0052cc; --success: #10b981; }

    body {
      font-family: 'Inter', -apple-system, sans-serif;
      background: linear-gradient(135deg, #0a1628 0%, #1a2f5a 100%);
      min-height: 100vh;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      padding: 24px; color: white;
    }

    .container { max-width: 480px; width: 100%; text-align: center; }

    .logo {
      display: inline-flex; align-items: center; gap: 10px; margin-bottom: 40px;
    }
    .logo-icon {
      width: 40px; height: 40px; background: var(--primary);
      border-radius: 10px; display: flex; align-items: center; justify-content: center;
    }
    .logo-text { font-size: 20px; font-weight: 700; color: white; }

    .card {
      background: rgba(255,255,255,0.07);
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 24px; padding: 40px 32px;
      backdrop-filter: blur(10px);
    }

    .ring-wrap { position: relative; width: 120px; height: 120px; margin: 0 auto 28px; }
    .ring-svg { width: 120px; height: 120px; transform: rotate(-90deg); }
    .ring-bg { fill: none; stroke: rgba(255,255,255,0.1); stroke-width: 6; }
    .ring-progress {
      fill: none; stroke: var(--primary); stroke-width: 6;
      stroke-linecap: round;
      stroke-dasharray: 283; stroke-dashoffset: 283;
      transition: stroke-dashoffset 1s linear;
      filter: drop-shadow(0 0 8px rgba(0,102,255,0.7));
    }
    .ring-num {
      position: absolute; inset: 0;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
    }
    .countdown { font-size: 36px; font-weight: 700; color: white; line-height: 1; }
    .countdown-label { font-size: 11px; color: rgba(255,255,255,0.5); font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 4px; }

    .preparing { font-size: 13px; color: #93c5fd; margin-bottom: 20px; font-weight: 500; }
    .file-url {
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 10px; padding: 12px 16px;
      font-size: 13px; color: #60a5fa; word-break: break-all; margin-bottom: 24px;
      font-family: 'SFMono-Regular', Consolas, monospace;
    }

    .cta-box {
      background: linear-gradient(135deg, rgba(16,185,129,0.15), rgba(5,150,105,0.1));
      border: 1px solid rgba(16,185,129,0.3);
      border-radius: 14px; padding: 20px; margin-bottom: 28px;
    }
    .cta-title { font-size: 15px; font-weight: 700; color: white; margin-bottom: 6px; }
    .cta-text { font-size: 13px; color: rgba(255,255,255,0.75); line-height: 1.6; }
    .cta-number {
      display: inline-block; margin-top: 10px;
      background: var(--success); color: white;
      padding: 6px 18px; border-radius: 20px;
      font-size: 15px; font-weight: 700; letter-spacing: 0.3px;
      text-decoration: none;
    }

    .skip-link {
      display: inline-flex; align-items: center; gap: 6px;
      color: rgba(255,255,255,0.5); font-size: 13px; text-decoration: none;
      padding: 10px 16px;
      border: 1px solid rgba(255,255,255,0.15); border-radius: 10px;
      transition: all 0.2s;
    }
    .skip-link:hover { color: white; border-color: rgba(255,255,255,0.35); background: rgba(255,255,255,0.05); }

    .progress-bar { height: 3px; background: rgba(255,255,255,0.1); border-radius: 2px; margin-top: 28px; overflow: hidden; }
    .progress-fill {
      height: 100%; background: var(--primary); border-radius: 2px; width: 0%;
      transition: width 1s linear; box-shadow: 0 0 8px rgba(0,102,255,0.6);
    }

    @media (max-width: 480px) { .card { padding: 32px 20px; border-radius: 20px; } }
  </style>
</head>
<body>
<div class="container">
  <div class="logo">
    <div class="logo-icon">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776" />
      </svg>
    </div>
    <span class="logo-text">Whizpoint Solutions</span>
  </div>

  <div class="card">
    <div class="ring-wrap">
      <svg class="ring-svg" viewBox="0 0 100 100">
        <circle class="ring-bg" cx="50" cy="50" r="45"/>
        <circle class="ring-progress" id="ring" cx="50" cy="50" r="45"/>
      </svg>
      <div class="ring-num">
        <div class="countdown" id="countdown">10</div>
        <div class="countdown-label">sec</div>
      </div>
    </div>

    <p class="preparing">The file is being prepared...</p>
    <div class="file-url">You are about to visit<br>${fileUrl}</div>

    <div class="cta-box">
      <div class="cta-title">Need Help with Cyber, iTax or E-Citizen?</div>
      <div class="cta-text">For any Cyber, iTax, or E-Citizen services, please text or call</div>
      <a href="tel:0740841168" class="cta-number">0740841168</a>
    </div>

    <a href="/${filename}?download=true" class="skip-link">
      <svg viewBox="0 0 20 20" fill="currentColor" width="15" height="15">
        <path d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.235a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.955 3.129V2.75z"/>
        <path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z"/>
      </svg>
      Download Now (skip countdown)
    </a>

    <div class="progress-bar">
      <div class="progress-fill" id="progress"></div>
    </div>
  </div>
</div>

<script>
  const TOTAL = 10;
  const circumference = 2 * Math.PI * 45;
  const ring = document.getElementById('ring');
  const countEl = document.getElementById('countdown');
  const progress = document.getElementById('progress');
  const redirectUrl = '/${filename}?download=true';

  let remaining = TOTAL;

  function tick() {
    remaining--;
    countEl.textContent = remaining;
    const pct = (TOTAL - remaining) / TOTAL;
    ring.style.strokeDashoffset = circumference * (1 - pct);
    progress.style.width = (pct * 100) + '%';
    if (remaining <= 0) {
      window.location.href = redirectUrl;
    } else {
      setTimeout(tick, 1000);
    }
  }

  setTimeout(() => {
    ring.style.strokeDashoffset = circumference * (1 - 1/TOTAL);
    progress.style.width = (100/TOTAL) + '%';
    setTimeout(tick, 1000);
  }, 100);
</script>
</body>
</html>`;
}

// Dashboard route (updated to use SQLite)
app.get('/', (req, res) => {
  try {
    const files = db.prepare('SELECT * FROM files ORDER BY created_at ASC').all();
    res.send(renderDashboard(files || []));
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).send('Error loading dashboard');
  }
});

// PDF interceptor & streaming serve route (updated to use SQLite)
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
    // Increment visit count using SQLite (fire-and-forget)
    try {
      db.prepare('UPDATE files SET visit_count = visit_count + 1 WHERE filename = ?').run(filename);
    } catch (err) {
      console.error('Visit count error:', err);
    }

    // Stream the PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="' + filename + '"');
    const stream = fs.createReadStream(filePath);
    stream.on('error', () => res.status(500).send('Error reading file'));
    return stream.pipe(res);
  }

  // Show splash/interstitial
  try {
    const fileRecord = db.prepare('SELECT display_name FROM files WHERE filename = ?').get(filename);
    const displayName = fileRecord?.display_name || filename.replace('.pdf', '');
    res.send(renderSplash(filename, displayName));
  } catch (err) {
    console.error('Splash error:', err);
    res.send(renderSplash(filename, filename.replace('.pdf', '')));
  }
});

app.listen(PORT, () => {
  console.log('Server running on port ' + PORT);
});
