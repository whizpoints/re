import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  host: process.env.BREVO_SMTP_SERVER || 'smtp-relay.brevo.com',
  port: parseInt(process.env.BREVO_SMTP_PORT || '587', 10),
  secure: process.env.BREVO_SMTP_PORT === '465',
  auth: {
    user: process.env.BREVO_SMTP_LOGIN || '',
    pass: process.env.BREVO_SMTP_KEY || '',
  },
});

const getFromAddress = () => {
  const name = process.env.BREVO_FROM_NAME || 'Whizpoint Flipbook';
  const email = process.env.BREVO_FROM_EMAIL || 'noreply@whizpoint.app';
  return `"${name}" <${email}>`;
};

const getAppUrl = (overrideUrl?: string) => {
  return overrideUrl || process.env.NEXT_PUBLIC_APP_URL || 'https://e.whizpoint.app';
};

const LOGO_URL = 'https://www.whizpoint.app/_next/image?url=%2Ficon.png&w=1920&q=75';

// Shared responsive email wrapper
export function renderEmailWrapper({
  title,
  preheader,
  contentHtml,
  baseUrl,
}: {
  title: string;
  preheader?: string;
  contentHtml: string;
  baseUrl?: string;
}) {
  const appUrl = getAppUrl(baseUrl);
  const cleanDomain = appUrl.replace(/^https?:\/\//, '');
  const year = new Date().getFullYear();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${title}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f1f5f9;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      color: #334155;
    }
    table {
      border-collapse: collapse;
    }
    img {
      border: 0;
      line-height: 100%;
      outline: none;
      text-decoration: none;
    }
    .email-container {
      max-width: 620px;
      margin: 32px auto;
      background: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      border: 1px solid #e2e8f0;
      box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.05), 0 8px 10px -6px rgba(15, 23, 42, 0.03);
    }
    .email-header {
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 50%, #4f46e5 100%);
      padding: 36px 32px;
      text-align: center;
    }
    .email-body {
      padding: 36px 32px;
      background: #ffffff;
      line-height: 1.65;
      font-size: 15px;
      color: #334155;
    }
    .btn-primary {
      display: inline-block;
      background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%);
      color: #ffffff !important;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 10px;
      font-weight: 600;
      font-size: 15px;
      letter-spacing: 0.2px;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
    }
    .info-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 20px;
      margin: 24px 0;
    }
    .info-card-highlight {
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      border-radius: 12px;
      padding: 20px;
      margin: 24px 0;
    }
    .info-card-warning {
      background: #fffbeb;
      border: 1px solid #fde68a;
      border-radius: 12px;
      padding: 20px;
      margin: 24px 0;
    }
    .email-footer {
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
      padding: 32px;
      font-size: 13px;
      color: #64748b;
      line-height: 1.6;
    }
    .contact-badge {
      display: inline-block;
      padding: 4px 10px;
      background: #e2e8f0;
      color: #334155;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 500;
      text-decoration: none;
      margin: 2px 4px;
    }
  </style>
</head>
<body>
  ${preheader ? `<div style="display:none;font-size:1px;color:#f1f5f9;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">${preheader}</div>` : ''}
  
  <div class="email-container">
    <!-- BRAND HEADER -->
    <div class="email-header">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
        <tr>
          <td align="center">
            <a href="${appUrl}" target="_blank" style="text-decoration:none;">
              <table cellpadding="0" cellspacing="0" role="presentation" style="margin: 0 auto;">
                <tr>
                  <td align="center" style="background:#ffffff; border-radius:12px; padding:10px 16px; box-shadow:0 4px 12px rgba(0,0,0,0.1);">
                    <img src="${LOGO_URL}" alt="Whizpoint" width="130" style="display:block; max-height:42px; width:auto;" />
                  </td>
                </tr>
              </table>
            </a>
            <div style="color: #ffffff; font-size: 20px; font-weight: 700; margin-top: 16px; letter-spacing: -0.3px;">
              Whizpoint Flipbook
            </div>
            <div style="color: #bfdbfe; font-size: 13px; font-weight: 500; margin-top: 4px;">
              Interactive Digital Publications &bull; ${cleanDomain}
            </div>
          </td>
        </tr>
      </table>
    </div>

    <!-- MAIN BODY -->
    <div class="email-body">
      ${contentHtml}
    </div>

    <!-- BRAND FOOTER & CONTACTS -->
    <div class="email-footer">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
        <tr>
          <td align="center" style="padding-bottom: 16px;">
            <div style="font-weight: 700; color: #1e293b; font-size: 14px; margin-bottom: 8px;">
              Whizpoint Solutions
            </div>
            <div style="color: #64748b; font-size: 13px; margin-bottom: 12px;">
              Empowering publishers, businesses, and creators with next-generation digital reading experiences.
            </div>
            
            <div style="margin: 12px 0;">
              <a href="https://wa.me/254754783683" class="contact-badge" style="color:#059669;">💬 WhatsApp +254 754 783 683</a>
              <a href="tel:+254718311345" class="contact-badge" style="color:#1d4ed8;">📞 +254 718 311 345</a>
              <a href="mailto:support@whizpoint.app" class="contact-badge" style="color:#2563eb;">✉️ support@whizpoint.app</a>
              <span class="contact-badge" style="color:#475569;">📍 Nairobi, Kenya</span>
            </div>
          </td>
        </tr>
        <tr>
          <td align="center" style="border-top: 1px solid #e2e8f0; padding-top: 16px; font-size: 12px; color: #94a3b8;">
            <p style="margin: 0 0 6px 0;">
              &copy; ${year} Whizpoint Solutions. All rights reserved.
            </p>
            <p style="margin: 0;">
              <a href="${appUrl}" style="color: #2563eb; text-decoration: none;">Flipbook Platform</a> &bull; 
              <a href="https://whizpoint.app" style="color: #2563eb; text-decoration: none;">whizpoint.app</a> &bull; 
              <a href="${appUrl}/privacy" style="color: #64748b; text-decoration: none;">Privacy Policy</a> &bull; 
              <a href="${appUrl}/terms" style="color: #64748b; text-decoration: none;">Terms of Service</a>
            </p>
          </td>
        </tr>
      </table>
    </div>
  </div>
</body>
</html>`;
}

// Safe sending helper to prevent unhandled rejection in serverless
async function sendEmailSafely(mailOptions: nodemailer.SendMailOptions) {
  if (!process.env.BREVO_SMTP_LOGIN || !process.env.BREVO_SMTP_KEY) {
    console.warn('[EMAIL SERVICE] Brevo SMTP credentials not configured. Skipping dispatch to:', mailOptions.to);
    return null;
  }
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('[EMAIL SERVICE] Successfully sent email to:', mailOptions.to, 'MessageId:', info.messageId);
    return info;
  } catch (error) {
    console.error('[EMAIL SERVICE ERROR] Failed to send email to:', mailOptions.to, error);
    return null;
  }
}

// ----------------------------------------------------------------------
// 1. Email Verification
// ----------------------------------------------------------------------
export const sendVerificationEmail = async (
  to: string,
  name: string,
  verifyLink: string,
  baseUrl?: string
) => {
  const contentHtml = `
    <h2 style="margin: 0 0 16px 0; color: #0f172a; font-size: 22px; font-weight: 700;">
      Verify Your Email Address ✉️
    </h2>
    <p>Hi <strong>${name}</strong>,</p>
    <p>Thank you for signing up with <strong>Whizpoint Flipbook</strong>! To activate your account and start converting your PDF documents and A3 booklet spreads into interactive flipbooks, please verify your email address.</p>
    
    <div style="text-align: center; margin: 32px 0;">
      <a href="${verifyLink}" class="btn-primary" target="_blank">
        Verify My Email Now &rarr;
      </a>
    </div>

    <p style="font-size: 13px; color: #64748b;">
      If the button above does not work, copy and paste this verification URL into your browser:
    </p>
    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; word-break: break-all; font-family: monospace; font-size: 13px; color: #2563eb;">
      ${verifyLink}
    </div>

    <div class="info-card" style="margin-top: 28px;">
      <div style="font-weight: 600; color: #0f172a; margin-bottom: 4px; font-size: 13px;">🔒 Security Notice</div>
      <div style="font-size: 12px; color: #64748b;">
        This verification link was sent to <strong>${to}</strong>. If you did not create an account on Whizpoint Flipbook, you can safely ignore this email.
      </div>
    </div>
  `;

  return sendEmailSafely({
    from: getFromAddress(),
    to,
    subject: 'Verify your Whizpoint Flipbook Account',
    html: renderEmailWrapper({
      title: 'Verify your email - Whizpoint Flipbook',
      preheader: 'Please verify your email address to get started with Whizpoint Flipbook.',
      contentHtml,
      baseUrl,
    }),
  });
};

// ----------------------------------------------------------------------
// 2. Welcome Email
// ----------------------------------------------------------------------
export const sendWelcomeEmail = async (to: string, name: string, baseUrl?: string) => {
  const appUrl = getAppUrl(baseUrl);
  const contentHtml = `
    <h2 style="margin: 0 0 16px 0; color: #0f172a; font-size: 22px; font-weight: 700;">
      Welcome to Whizpoint Flipbook! 🎉
    </h2>
    <p>Hi <strong>${name}</strong>,</p>
    <p>Your email has been verified, and your account is now fully active! Welcome to the modern standard in interactive digital publications.</p>
    
    <div class="info-card-highlight">
      <div style="font-weight: 700; color: #1d4ed8; font-size: 15px; margin-bottom: 10px;">
        🚀 What you can do right now:
      </div>
      <ul style="margin: 0; padding-left: 20px; color: #334155; font-size: 14px; line-height: 1.8;">
        <li><strong>A3 Booklet Spread Splitting:</strong> Upload your print-ready A3 sheets; our system automatically formats them into sequential A4 flip pages.</li>
        <li><strong>A4 Direct Documents:</strong> Upload standard A4 reports, magazines, and portfolios with 1:1 page rendering.</li>
        <li><strong>Compact QR Codes:</strong> Every document gets a tiny, scan-ready QR code powered by <code>${appUrl.replace(/^https?:\/\//, '')}</code>.</li>
        <li><strong>Zero-Distraction Light Mode:</strong> Crystal-clear, responsive reader that looks stunning on phones, tablets, and desktops.</li>
      </ul>
    </div>

    <div style="text-align: center; margin: 32px 0;">
      <a href="${appUrl}/dashboard" class="btn-primary" target="_blank">
        Launch Your Dashboard &rarr;
      </a>
    </div>

    <p style="margin-top: 24px; color: #475569;">
      Need any assistance or custom enterprise integrations? Just reply to this email or reach us on WhatsApp at <strong>+254 754 783 683</strong> (or call <strong>+254 718 311 345</strong>).
    </p>
  `;

  return sendEmailSafely({
    from: getFromAddress(),
    to,
    subject: 'Welcome to Whizpoint Flipbook! 📚',
    html: renderEmailWrapper({
      title: 'Welcome to Whizpoint Flipbook',
      preheader: 'Your account is ready! Start publishing interactive digital flipbooks.',
      contentHtml,
      baseUrl,
    }),
  });
};

// ----------------------------------------------------------------------
// 3. Password Reset Email
// ----------------------------------------------------------------------
export const sendPasswordResetEmail = async (to: string, resetLink: string, baseUrl?: string) => {
  const contentHtml = `
    <h2 style="margin: 0 0 16px 0; color: #0f172a; font-size: 22px; font-weight: 700;">
      Password Reset Request 🔑
    </h2>
    <p>Hi there,</p>
    <p>We received a request to reset the password for your Whizpoint Flipbook account (<strong>${to}</strong>).</p>
    <p>Click the button below to choose a new, secure password. For your protection, this link is valid for <strong>1 hour</strong>.</p>
    
    <div style="text-align: center; margin: 32px 0;">
      <a href="${resetLink}" class="btn-primary" target="_blank">
        Reset My Password &rarr;
      </a>
    </div>

    <p style="font-size: 13px; color: #64748b;">
      Or copy and paste this link into your browser:
    </p>
    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; word-break: break-all; font-family: monospace; font-size: 13px; color: #2563eb;">
      ${resetLink}
    </div>

    <div class="info-card-warning" style="margin-top: 28px;">
      <div style="font-weight: 600; color: #92400e; margin-bottom: 4px; font-size: 13px;">⚠️ Did not request this?</div>
      <div style="font-size: 12px; color: #78350f;">
        If you did not request a password reset, please ignore this email. Your existing password remains completely secure. If you suspect unauthorized access, contact us at <a href="mailto:support@whizpoint.app" style="color:#b45309; font-weight:600;">support@whizpoint.app</a>.
      </div>
    </div>
  `;

  return sendEmailSafely({
    from: getFromAddress(),
    to,
    subject: 'Reset your Whizpoint Flipbook password',
    html: renderEmailWrapper({
      title: 'Password Reset - Whizpoint Flipbook',
      preheader: 'Follow the link to reset your Whizpoint Flipbook password.',
      contentHtml,
      baseUrl,
    }),
  });
};

// ----------------------------------------------------------------------
// 4. Document Published & Live Email
// ----------------------------------------------------------------------
export const sendDocumentPublishedEmail = async ({
  to,
  name,
  title,
  slug,
  pageCount,
  isBooklet,
  baseUrl,
}: {
  to: string;
  name: string;
  title: string;
  slug: string;
  pageCount: number;
  isBooklet?: boolean;
  baseUrl?: string;
}) => {
  const appUrl = getAppUrl(baseUrl);
  const publicUrl = `${appUrl}/${slug}`;
  const qrUrl = `${appUrl}/admin/documents`;

  const contentHtml = `
    <h2 style="margin: 0 0 16px 0; color: #0f172a; font-size: 22px; font-weight: 700;">
      Your Flipbook is Live! 🚀📖
    </h2>
    <p>Hi <strong>${name}</strong>,</p>
    <p>Great news! Your publication <strong>"${title}"</strong> has been successfully processed and published online.</p>

    <!-- PUBLICATION DETAILS CARD -->
    <div class="info-card-highlight">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
        <tr>
          <td style="padding-bottom: 8px; font-size: 13px; color: #64748b;">Publication Title:</td>
          <td align="right" style="padding-bottom: 8px; font-weight: 700; color: #0f172a; font-size: 14px;">${title}</td>
        </tr>
        <tr>
          <td style="padding-bottom: 8px; font-size: 13px; color: #64748b;">Total Pages:</td>
          <td align="right" style="padding-bottom: 8px; font-weight: 700; color: #2563eb; font-size: 14px;">${pageCount} pages</td>
        </tr>
        <tr>
          <td style="padding-bottom: 8px; font-size: 13px; color: #64748b;">Processing Mode:</td>
          <td align="right" style="padding-bottom: 8px; font-weight: 600; color: #059669; font-size: 13px;">
            ${isBooklet ? 'A3 Booklet (Imposed & Split)' : 'A4 Direct Flow'}
          </td>
        </tr>
        <tr>
          <td style="padding-top: 8px; border-top: 1px dashed #bfdbfe; font-size: 13px; color: #64748b;">Public Short Link:</td>
          <td align="right" style="padding-top: 8px; border-top: 1px dashed #bfdbfe; font-family: monospace; font-size: 13px; font-weight: 700;">
            <a href="${publicUrl}" target="_blank" style="color: #2563eb; text-decoration: none;">${publicUrl}</a>
          </td>
        </tr>
      </table>
    </div>

    <div style="text-align: center; margin: 32px 0;">
      <a href="${publicUrl}" class="btn-primary" target="_blank" style="margin-right: 12px;">
        View Live Flipbook &rarr;
      </a>
    </div>

    <!-- MARKETING & QR TIPS -->
    <div class="info-card">
      <div style="font-weight: 700; color: #0f172a; font-size: 14px; margin-bottom: 8px;">
        💡 Marketing & Distribution Tips:
      </div>
      <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #475569; line-height: 1.7;">
        <li><strong>Download Your QR Code:</strong> Head to your <a href="${qrUrl}" style="color:#2563eb; font-weight:600;">Documents Manager</a> to download your high-res SVG/PNG QR code for print banners, business cards, or product tags.</li>
        <li><strong>Share on Social Media:</strong> Post the short link <code>${publicUrl}</code> directly on WhatsApp, LinkedIn, X, and Facebook — rich open graph preview cards will appear automatically.</li>
        <li><strong>Track Views:</strong> Our real-time analytics engine monitors reader engagement and will notify you as your readership grows.</li>
      </ul>
    </div>
  `;

  return sendEmailSafely({
    from: getFromAddress(),
    to,
    subject: `Your Flipbook is Live: "${title}" 📖`,
    html: renderEmailWrapper({
      title: `${title} is now live on Whizpoint Flipbook`,
      preheader: `Your publication "${title}" (${pageCount} pages) is ready to share.`,
      contentHtml,
      baseUrl,
    }),
  });
};

// ----------------------------------------------------------------------
// 5. Document Upload / Processing Failed Email
// ----------------------------------------------------------------------
export const sendDocumentUploadFailedEmail = async ({
  to,
  name,
  title,
  error,
  baseUrl,
}: {
  to: string;
  name: string;
  title: string;
  error?: string;
  baseUrl?: string;
}) => {
  const appUrl = getAppUrl(baseUrl);
  const uploadUrl = `${appUrl}/admin/upload`;

  const contentHtml = `
    <h2 style="margin: 0 0 16px 0; color: #dc2626; font-size: 22px; font-weight: 700;">
      Document Upload Issue ⚠️
    </h2>
    <p>Hi <strong>${name}</strong>,</p>
    <p>We ran into an unexpected issue while processing your publication <strong>"${title}"</strong>.</p>

    <div class="info-card-warning">
      <div style="font-weight: 700; color: #991b1b; font-size: 14px; margin-bottom: 6px;">
        Error Details:
      </div>
      <div style="font-family: monospace; font-size: 13px; color: #7f1d1d; word-break: break-all;">
        ${error || 'An error occurred during page rendering or cloud storage synchronization.'}
      </div>
    </div>

    <div class="info-card">
      <div style="font-weight: 700; color: #0f172a; font-size: 14px; margin-bottom: 8px;">
        🛠️ Quick Troubleshooting Guide:
      </div>
      <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #475569; line-height: 1.7;">
        <li><strong>PDF Password Protection:</strong> Ensure the PDF file is not password-protected or restricted from rendering.</li>
        <li><strong>Corrupted Fonts or Layers:</strong> Try re-exporting the PDF using standard "Press Quality" or "Web Quality" settings.</li>
        <li><strong>File Size & Memory:</strong> For very large documents (50+ MB), consider compressing images before uploading.</li>
        <li><strong>Format Mode:</strong> If uploading an A3 booklet, select "A3 Booklet Split" on the upload screen; if standard A4, choose "A4 Direct".</li>
      </ul>
    </div>

    <div style="text-align: center; margin: 32px 0;">
      <a href="${uploadUrl}" class="btn-primary" target="_blank">
        Retry Upload &rarr;
      </a>
    </div>

    <p style="font-size: 13px; color: #64748b;">
      Need hands-on help? Contact our technical support team at <a href="mailto:support@whizpoint.app" style="color: #2563eb;">support@whizpoint.app</a> or WhatsApp us at <strong>+254 754 783 683</strong> (call: <strong>+254 718 311 345</strong>) and we will inspect the document for you.
    </p>
  `;

  return sendEmailSafely({
    from: getFromAddress(),
    to,
    subject: `Action Required: Upload issue with "${title}"`,
    html: renderEmailWrapper({
      title: `Upload issue with ${title} - Whizpoint Flipbook`,
      preheader: `We encountered an issue processing "${title}". Here are quick steps to resolve it.`,
      contentHtml,
      baseUrl,
    }),
  });
};

// ----------------------------------------------------------------------
// 6. View Milestones / Analytics Report Email
// ----------------------------------------------------------------------
export const sendViewMilestoneEmail = async ({
  to,
  name,
  title,
  slug,
  views,
  baseUrl,
}: {
  to: string;
  name: string;
  title: string;
  slug: string;
  views: number;
  baseUrl?: string;
}) => {
  const appUrl = getAppUrl(baseUrl);
  const publicUrl = `${appUrl}/${slug}`;

  const contentHtml = `
    <h2 style="margin: 0 0 16px 0; color: #0f172a; font-size: 22px; font-weight: 700;">
      Milestone Reached! 🎉 ${views.toLocaleString()} Readers
    </h2>
    <p>Hi <strong>${name}</strong>,</p>
    <p>Exciting news! Your digital publication <strong>"${title}"</strong> just crossed a major milestone of <strong>${views.toLocaleString()} views</strong> on Whizpoint Flipbook.</p>

    <!-- STATS CARD -->
    <div style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border: 1px solid #93c5fd; border-radius: 14px; padding: 24px; text-align: center; margin: 28px 0;">
      <div style="font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: #1e40af; font-weight: 700;">
        Total Document Impressions
      </div>
      <div style="font-size: 44px; font-weight: 800; color: #1d4ed8; line-height: 1.1; margin: 8px 0;">
        ${views.toLocaleString()}
      </div>
      <div style="font-size: 13px; color: #3b82f6; font-weight: 500;">
        Active Link: <a href="${publicUrl}" style="color: #1d4ed8; text-decoration: underline;">${publicUrl}</a>
      </div>
    </div>

    <div style="text-align: center; margin: 32px 0;">
      <a href="${publicUrl}" class="btn-primary" target="_blank" style="margin-right: 12px;">
        View Your Publication &rarr;
      </a>
      <a href="${appUrl}/dashboard" style="display: inline-block; padding: 14px 24px; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 10px; font-weight: 600; font-size: 14px; color: #334155; text-decoration: none;">
        Go to Dashboard
      </a>
    </div>

    <p style="font-size: 14px; color: #475569;">
      Keep the momentum going! You can share your document link or QR code across WhatsApp groups, email newsletters, and customer touchpoints to reach even more readers.
    </p>
  `;

  return sendEmailSafely({
    from: getFromAddress(),
    to,
    subject: `🎉 Milestone: "${title}" reached ${views.toLocaleString()} views!`,
    html: renderEmailWrapper({
      title: `${views} views on ${title} - Whizpoint Flipbook`,
      preheader: `Congratulations! "${title}" just reached ${views.toLocaleString()} views on Whizpoint Flipbook.`,
      contentHtml,
      baseUrl,
    }),
  });
};

// ----------------------------------------------------------------------
// 7. Custom HTML Broadcast & Tester Email
// ----------------------------------------------------------------------
export const sendCustomHtmlEmail = async ({
  to,
  subject,
  html,
  wrapInBrandedTemplate = true,
  baseUrl,
}: {
  to: string;
  subject: string;
  html: string;
  wrapInBrandedTemplate?: boolean;
  baseUrl?: string;
}) => {
  const finalHtml = wrapInBrandedTemplate
    ? renderEmailWrapper({
        title: subject,
        contentHtml: html,
        baseUrl,
      })
    : html;

  return sendEmailSafely({
    from: getFromAddress(),
    to,
    subject,
    html: finalHtml,
  });
};
