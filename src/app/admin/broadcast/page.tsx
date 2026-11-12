'use client';

import { useState, useEffect } from 'react';
import { Mail, Send, Eye, CheckCircle2, AlertTriangle, Users, Sparkles, Smartphone, Monitor } from 'lucide-react';
import { toast } from 'react-hot-toast';

const STARTER_TEMPLATES = {
  announcement: `<h2 style="color: #0f172a; font-size: 24px; font-weight: 700; margin-top: 0;">Exciting News from Whizpoint Flipbook! 🚀</h2>
<p>Hi there,</p>
<p>We are thrilled to introduce major enhancements to the <strong>Whizpoint Flipbook platform</strong>. Your digital publishing workflow is now faster, sharper, and more flexible than ever.</p>

<div style="background: #f8fafc; border-left: 4px solid #2563eb; padding: 16px 20px; margin: 24px 0; border-radius: 0 10px 10px 0;">
  <h3 style="margin: 0 0 8px 0; color: #1e293b; font-size: 16px;">What's New in this Release:</h3>
  <ul style="margin: 0; padding-left: 20px; color: #475569; line-height: 1.8; font-size: 14px;">
    <li><strong>Dual-Mode Uploads:</strong> Dedicated high-precision splitting for A3 booklets + 1:1 direct flow for A4 documents.</li>
    <li><strong>Ultra-Compact QR Codes:</strong> Powered by our short domain for high-density, sharp printing on business cards and posters.</li>
    <li><strong>Smart Readership Analytics:</strong> Automatic milestone notifications as your publications reach new readers.</li>
  </ul>
</div>

<div style="text-align: center; margin: 32px 0;">
  <a href="https://e.whizpoint.app/admin" style="display: inline-block; background: #2563eb; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 600; font-size: 15px;">
    Explore Your Dashboard &rarr;
  </a>
</div>

<p style="color: #64748b; font-size: 14px;">
  Thank you for being part of the Whizpoint family! If you have any feedback or custom requests, feel free to reply directly to this email.
</p>`,

  featureUpdate: `<h2 style="color: #0f172a; font-size: 22px; font-weight: 700; margin-top: 0;">Feature Spotlight: Seamless A3 Booklet Publishing 📖</h2>
<p>Did you know? You can now upload your print-ready A3 landscape spreads, and Whizpoint Flipbook will automatically split and sequentially impose every single A4 page for you!</p>

<div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 20px; margin: 24px 0;">
  <div style="font-weight: 700; color: #1d4ed8; font-size: 15px; margin-bottom: 6px;">💡 How to use it:</div>
  <p style="margin: 0; font-size: 14px; color: #334155; line-height: 1.6;">
    1. Export your publication from InDesign or Illustrator as an A3 PDF.<br>
    2. Select <strong>"A3 Booklet Split"</strong> on your upload screen.<br>
    3. Generate a stunning digital flipbook with zero manual cropping!
  </p>
</div>

<div style="text-align: center; margin: 28px 0;">
  <a href="https://e.whizpoint.app/admin/upload?type=a3" style="display: inline-block; background: #059669; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-weight: 600; font-size: 14px;">
    Upload an A3 Booklet &rarr;
  </a>
</div>`,

  blank: `<h2 style="color: #0f172a;">Your Custom Message Here</h2>
<p>Write or paste your custom HTML broadcast here.</p>`,
};

export default function BroadcastPage() {
  const [mode, setMode] = useState<'test' | 'broadcast'>('test');
  const [subject, setSubject] = useState('Important Update from Whizpoint Flipbook');
  const [recipients, setRecipients] = useState('admin@whizpoint.app');
  const [htmlContent, setHtmlContent] = useState(STARTER_TEMPLATES.announcement);
  const [wrapInTemplate, setWrapInTemplate] = useState(true);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [registeredUserCount, setRegisteredUserCount] = useState<number | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [lastResult, setLastResult] = useState<{
    success: boolean;
    sentCount: number;
    failedCount: number;
    sentEmails: string[];
    failedEmails: { email: string; error: string }[];
  } | null>(null);

  useEffect(() => {
    // Fetch registered users to display broadcast count
    const token = localStorage.getItem('auth_token');
    fetch('/api/admin/users', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.users && Array.isArray(data.users)) {
          setRegisteredUserCount(data.users.length);
        }
      })
      .catch(console.error);
  }, []);

  const handleSend = async () => {
    if (!subject.trim()) {
      toast.error('Please enter an email subject line');
      return;
    }
    if (!htmlContent.trim()) {
      toast.error('Please enter email HTML content');
      return;
    }

    if (mode === 'test' && !recipients.trim()) {
      toast.error('Please specify at least one recipient email address');
      return;
    }

    if (
      mode === 'broadcast' &&
      !confirm(`Are you sure you want to broadcast this email to all ${registeredUserCount ?? 'registered'} customers?`)
    ) {
      return;
    }

    setIsSending(true);
    setLastResult(null);

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/admin/broadcast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          subject,
          html: htmlContent,
          recipients: mode === 'test' ? recipients : undefined,
          broadcastAll: mode === 'broadcast',
          wrapInTemplate,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send broadcast');
      }

      setLastResult(data);
      if (data.sentCount > 0) {
        toast.success(`Successfully dispatched email to ${data.sentCount} recipient(s)!`);
      } else {
        toast.error('No emails were sent. Check SMTP credentials or recipient addresses.');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Error occurred while sending');
    } finally {
      setIsSending(false);
    }
  };

  // Build preview HTML with or without Whizpoint branded shell
  const previewHtml = wrapInTemplate
    ? `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #f1f5f9; margin: 0; padding: 20px; color: #334155; }
    .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; }
    .header { background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 50%, #4f46e5 100%); padding: 32px 20px; text-align: center; color: white; }
    .body { padding: 32px; line-height: 1.6; }
    .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 24px; text-align: center; font-size: 12px; color: #64748b; }
    .badge { display: inline-block; padding: 3px 8px; background: #e2e8f0; border-radius: 4px; font-size: 11px; margin: 2px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div style="background:white; display:inline-block; border-radius:10px; padding:6px 14px; margin-bottom:10px;">
        <img src="https://www.whizpoint.app/_next/image?url=%2Ficon.png&w=1920&q=75" height="34" style="vertical-align:middle;" />
      </div>
      <div style="font-size: 18px; font-weight: 700;">Whizpoint Flipbook</div>
      <div style="font-size: 12px; opacity: 0.9;">Interactive Digital Publications &bull; e.whizpoint.app</div>
    </div>
    <div class="body">
      ${htmlContent}
    </div>
    <div class="footer">
      <div style="font-weight: 700; color: #1e293b; margin-bottom: 6px;">Whizpoint Solutions</div>
      <div>📞 +254 718 311 345 &bull; ✉️ support@whizpoint.app &bull; 📍 Nairobi, Kenya</div>
      <div style="margin-top: 10px; color: #94a3b8;">&copy; ${new Date().getFullYear()} Whizpoint Solutions. All rights reserved.</div>
    </div>
  </div>
</body>
</html>`
    : `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="margin: 0; padding: 20px; font-family: sans-serif;">${htmlContent}</body></html>`;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Admin Email Dispatcher
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Email Broadcast & Tester</h1>
          <p className="text-slate-500 text-sm mt-1">
            Design, preview, and broadcast custom HTML marketing announcements or run instant test dispatches.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3">
            <Users className="w-5 h-5 text-blue-600" />
            <div>
              <div className="text-xs text-slate-500 font-medium">Registered Customers</div>
              <div className="text-lg font-bold text-slate-900">
                {registeredUserCount !== null ? registeredUserCount : '...'} users
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Form Left, Preview Right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT COLUMN: Controls & HTML Editor */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Mail className="w-5 h-5 text-blue-600" />
              Campaign Details
            </h2>

            {/* Target Audience Mode Tabs */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Recipient Target
              </label>
              <div className="grid grid-cols-2 gap-3 p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setMode('test')}
                  className={`py-2 px-3 rounded-lg text-sm font-semibold transition-all ${
                    mode === 'test'
                      ? 'bg-white text-blue-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  🧪 Custom / Test Send
                </button>
                <button
                  type="button"
                  onClick={() => setMode('broadcast')}
                  className={`py-2 px-3 rounded-lg text-sm font-semibold transition-all ${
                    mode === 'broadcast'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  📢 Broadcast to All ({registeredUserCount ?? 0})
                </button>
              </div>
            </div>

            {/* Recipients Input (when mode === 'test') */}
            {mode === 'test' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Recipient Email(s)
                </label>
                <input
                  type="text"
                  value={recipients}
                  onChange={(e) => setRecipients(e.target.value)}
                  placeholder="admin@whizpoint.app, client@example.com"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white font-mono"
                />
                <span className="text-xs text-slate-400 mt-1 block">
                  Separate multiple addresses with commas
                </span>
              </div>
            )}

            {mode === 'broadcast' && (
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-800 leading-relaxed">
                  <strong>Notice:</strong> This broadcast will be delivered directly to all{' '}
                  <strong>{registeredUserCount ?? 0} registered customer accounts</strong> via Brevo SMTP.
                </div>
              </div>
            )}

            {/* Subject Line */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Email Subject Line
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Subject of your broadcast..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white font-medium"
              />
            </div>

            {/* Branded Wrapper Checkbox */}
            <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
              <div>
                <div className="text-sm font-semibold text-slate-900">
                  Wrap in Whizpoint Brand Shell
                </div>
                <div className="text-xs text-slate-500">
                  Embeds official logo, brand colors, Whizpoint contacts, and footer links.
                </div>
              </div>
              <input
                type="checkbox"
                id="wrapToggle"
                checked={wrapInTemplate}
                onChange={(e) => setWrapInTemplate(e.target.checked)}
                className="w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
              />
            </div>

            {/* Starter Template Buttons */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  HTML Content
                </label>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-400">Templates:</span>
                  <button
                    type="button"
                    onClick={() => setHtmlContent(STARTER_TEMPLATES.announcement)}
                    className="text-xs px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
                  >
                    News
                  </button>
                  <button
                    type="button"
                    onClick={() => setHtmlContent(STARTER_TEMPLATES.featureUpdate)}
                    className="text-xs px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
                  >
                    Feature
                  </button>
                  <button
                    type="button"
                    onClick={() => setHtmlContent(STARTER_TEMPLATES.blank)}
                    className="text-xs px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {/* Code Textarea */}
              <textarea
                rows={14}
                value={htmlContent}
                onChange={(e) => setHtmlContent(e.target.value)}
                placeholder="Paste or write your raw HTML code here..."
                className="w-full p-4 bg-slate-900 text-slate-100 rounded-xl text-xs font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500"
                spellCheck={false}
              />
            </div>

            {/* Action Button */}
            <button
              type="button"
              onClick={handleSend}
              disabled={isSending}
              className={`w-full py-3.5 px-4 rounded-xl text-white font-semibold flex items-center justify-center gap-2 shadow-sm transition-all ${
                isSending
                  ? 'bg-slate-400 cursor-not-allowed'
                  : mode === 'broadcast'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-95'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isSending ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Dispatching Email via Brevo...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  {mode === 'broadcast'
                    ? `Dispatch Broadcast to All (${registeredUserCount ?? 0} Users)`
                    : 'Send Test Email Now'}
                </>
              )}
            </button>
          </div>

          {/* Delivery Report Card */}
          {lastResult && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
              <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Delivery Result Report
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-emerald-50 text-emerald-800 rounded-lg">
                  <div className="font-semibold text-lg">{lastResult.sentCount}</div>
                  <div>Successfully Dispatched</div>
                </div>
                <div className="p-3 bg-red-50 text-red-800 rounded-lg">
                  <div className="font-semibold text-lg">{lastResult.failedCount}</div>
                  <div>Failed Dispatches</div>
                </div>
              </div>

              {lastResult.sentEmails.length > 0 && (
                <div className="text-xs text-slate-600">
                  <strong>Delivered to:</strong> {lastResult.sentEmails.join(', ')}
                </div>
              )}

              {lastResult.failedEmails.length > 0 && (
                <div className="p-2.5 bg-red-50 text-red-700 rounded-lg text-xs space-y-1">
                  <strong>Errors:</strong>
                  {lastResult.failedEmails.map((f, i) => (
                    <div key={i}>
                      {f.email}: {f.error}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Live Responsive Preview */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <Eye className="w-4 h-4 text-blue-600" />
              Live Inbox Preview
            </div>

            {/* Viewport switch */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setPreviewDevice('desktop')}
                className={`p-1.5 rounded text-xs flex items-center gap-1 font-medium ${
                  previewDevice === 'desktop'
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-500'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                Desktop
              </button>
              <button
                type="button"
                onClick={() => setPreviewDevice('mobile')}
                className={`p-1.5 rounded text-xs flex items-center gap-1 font-medium ${
                  previewDevice === 'mobile'
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-500'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                Mobile
              </button>
            </div>
          </div>

          {/* Device Frame */}
          <div className="bg-slate-100 p-4 md:p-6 rounded-2xl border border-slate-200 min-h-[620px] flex justify-center items-start overflow-hidden">
            <div
              className={`transition-all duration-300 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden ${
                previewDevice === 'desktop' ? 'w-full max-w-xl' : 'w-[375px]'
              }`}
            >
              {/* Fake Email Client Bar */}
              <div className="bg-slate-100 border-b border-slate-200 p-3 text-xs text-slate-500 flex items-center justify-between">
                <span className="font-semibold text-slate-700 truncate">
                  Subject: {subject || 'No Subject'}
                </span>
                <span className="text-slate-400">noreply@whizpoint.app</span>
              </div>

              {/* Iframe for safe CSS isolation */}
              <iframe
                title="Email Preview"
                srcDoc={previewHtml}
                className="w-full h-[580px] border-0 bg-slate-50"
                sandbox="allow-same-origin"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
