import { jsPDF } from 'jspdf';
import { A4Template } from './templates/a4-templates';

export interface A4PosterData {
  documentTitle: string;
  slug: string;
  url: string;
  template: A4Template;
  // Custom texts
  customTitle?: string;
  customSubtitle?: string;
  badgeText?: string;
  // Memorial / Event fields
  personName?: string;
  sunriseDate?: string; // Birth
  sunsetDate?: string;  // Resting
  bottomNote?: string;
  // Photo
  photoUrl?: string | null;
  photoShape?: 'circle' | 'arch' | 'rounded' | 'none';
  // Custom Background
  customBgUrl?: string | null;
  // QR image data url
  qrDataUrl: string;
  // Hosting notice
  showHostingNotice?: boolean;
}

// 300 DPI A4 Dimensions (210mm x 297mm @ 300 DPI)
export const A4_WIDTH = 2480;
export const A4_HEIGHT = 3508;

/**
 * Renders the entire A4 poster onto a 2480x3508 canvas at 300 DPI
 */
export async function renderA4PosterToCanvas(data: A4PosterData): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  canvas.width = A4_WIDTH;
  canvas.height = A4_HEIGHT;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get 2D canvas context');

  const { template } = data;

  // 1. Draw Background
  if (data.customBgUrl) {
    try {
      const customImg = await loadImage(data.customBgUrl);
      ctx.drawImage(customImg, 0, 0, A4_WIDTH, A4_HEIGHT);
    } catch {
      drawFallbackGradient(ctx, template.bgGradient);
    }
  } else {
    drawFallbackGradient(ctx, template.bgGradient);
  }

  // Draw subtle decorative frame / border
  drawDecorativeFrame(ctx, template);

  // 2. Draw Top Badge
  const badgeText = (data.badgeText || template.badgeText || '').toUpperCase();
  if (badgeText) {
    drawPillBadge(ctx, badgeText, template.accentColor, template.textColor);
  }

  // 3. Draw Header Titles
  const mainTitle = data.customTitle || template.defaultTitle;
  const subtitle = data.customSubtitle || template.defaultSubtitle;

  let currentY = 320;

  // Main Title
  ctx.save();
  ctx.textAlign = 'center';
  ctx.fillStyle = template.titleColor;
  ctx.font = template.fontFamily === 'serif' 
    ? 'bold 78px "Times New Roman", Georgia, serif'
    : 'bold 74px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

  wrapText(ctx, mainTitle, A4_WIDTH / 2, currentY, A4_WIDTH - 360, 96);
  currentY += 120;

  // Person Name (if memorial / wedding / spotlight)
  if (data.personName && data.personName.trim()) {
    ctx.font = template.fontFamily === 'serif'
      ? 'italic bold 92px Georgia, serif'
      : 'bold 88px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillStyle = template.accentColor;
    ctx.fillText(data.personName.trim(), A4_WIDTH / 2, currentY);
    currentY += 110;
  }

  // Subtitle
  ctx.font = '40px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = template.subtitleColor;
  wrapText(ctx, subtitle, A4_WIDTH / 2, currentY, A4_WIDTH - 440, 56);
  currentY += 90;
  ctx.restore();

  // 4. Optional Photo / Portrait
  if (data.photoUrl && data.photoShape !== 'none') {
    try {
      const photoImg = await loadImage(data.photoUrl);
      const photoSize = 480;
      const photoX = (A4_WIDTH - photoSize) / 2;
      const photoY = currentY + 10;

      ctx.save();
      // Draw border / glow
      ctx.beginPath();
      if (data.photoShape === 'arch') {
        drawArch(ctx, photoX, photoY, photoSize, photoSize);
      } else {
        ctx.arc(photoX + photoSize / 2, photoY + photoSize / 2, photoSize / 2, 0, Math.PI * 2);
      }
      ctx.closePath();

      // Shadow
      ctx.shadowColor = 'rgba(0, 0, 0, 0.18)';
      ctx.shadowBlur = 40;
      ctx.shadowOffsetY = 15;
      ctx.fillStyle = '#ffffff';
      ctx.fill();

      // Clip image
      ctx.clip();
      ctx.drawImage(photoImg, photoX, photoY, photoSize, photoSize);
      ctx.restore();

      // Stroke border around photo
      ctx.save();
      ctx.lineWidth = 10;
      ctx.strokeStyle = template.accentColor;
      ctx.beginPath();
      if (data.photoShape === 'arch') {
        drawArch(ctx, photoX, photoY, photoSize, photoSize);
      } else {
        ctx.arc(photoX + photoSize / 2, photoY + photoSize / 2, photoSize / 2, 0, Math.PI * 2);
      }
      ctx.stroke();
      ctx.restore();

      currentY += photoSize + 60;
    } catch (e) {
      console.warn('Failed to draw portrait photo:', e);
    }
  }

  // 5. Draw Centered QR Card Container
  // Compute QR card position
  const qrCardWidth = 1080;
  const qrCardHeight = 1180;
  const qrCardX = (A4_WIDTH - qrCardWidth) / 2;
  const qrCardY = Math.max(currentY + 20, 1180);

  drawQRCard(ctx, qrCardX, qrCardY, qrCardWidth, qrCardHeight, data, template);

  // Load and draw the QR code image
  try {
    const qrImg = await loadImage(data.qrDataUrl);
    const qrSize = 780;
    const qrX = qrCardX + (qrCardWidth - qrSize) / 2;
    const qrY = qrCardY + 95;
    ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
  } catch (err) {
    console.error('Failed to draw QR code image:', err);
  }

  // 6. Draw Bottom Section
  let bottomY = qrCardY + qrCardHeight + 90;

  // If Memorial Sunrise & Sunset
  if (template.category === 'memorial' || template.showSunriseSunset) {
    drawSunriseSunset(ctx, bottomY, data.sunriseDate, data.sunsetDate, template);
    bottomY += 140;
  }

  // Bottom Note / Quote
  const noteText = data.bottomNote || template.defaultBottomNote;
  if (noteText) {
    ctx.save();
    ctx.textAlign = 'center';
    ctx.fillStyle = template.textColor;
    ctx.font = template.fontFamily === 'serif' 
      ? 'italic 38px Georgia, serif' 
      : '36px -apple-system, BlinkMacSystemFont, sans-serif';
    wrapText(ctx, noteText, A4_WIDTH / 2, bottomY, A4_WIDTH - 420, 56);
    ctx.restore();
  }

  // 7. Whizpoint Archival & Temporary Hosting Notice (Legal / System Branding)
  if (data.showHostingNotice !== false) {
    drawHostingNotice(ctx, data.slug);
  }

  return canvas;
}

// ---------------------------------------------------------------------------
// HELPER DRAWING FUNCTIONS
// ---------------------------------------------------------------------------

function drawFallbackGradient(ctx: CanvasRenderingContext2D, bgGradient: string) {
  // Create gradient
  const grad = ctx.createLinearGradient(0, 0, 0, A4_HEIGHT);
  if (bgGradient.includes('#0f172a') || bgGradient.includes('#09090b') || bgGradient.includes('#022c22')) {
    grad.addColorStop(0, '#090d16');
    grad.addColorStop(0.5, '#1e1b4b');
    grad.addColorStop(1, '#090d16');
  } else if (bgGradient.includes('#fef3c7') || bgGradient.includes('#fffbeb')) {
    grad.addColorStop(0, '#fffbeb');
    grad.addColorStop(0.35, '#fef3c7');
    grad.addColorStop(0.7, '#ede9fe');
    grad.addColorStop(1, '#fdf2f8');
  } else if (bgGradient.includes('#f0fdf4')) {
    grad.addColorStop(0, '#f0fdf4');
    grad.addColorStop(0.5, '#dcfce7');
    grad.addColorStop(1, '#f8fafc');
  } else if (bgGradient.includes('#eff6ff')) {
    grad.addColorStop(0, '#eff6ff');
    grad.addColorStop(0.4, '#dbeafe');
    grad.addColorStop(1, '#ffffff');
  } else {
    grad.addColorStop(0, '#f8fafc');
    grad.addColorStop(0.5, '#f1f5f9');
    grad.addColorStop(1, '#e2e8f0');
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, A4_WIDTH, A4_HEIGHT);
}

function drawDecorativeFrame(ctx: CanvasRenderingContext2D, template: A4Template) {
  const inset = 60;
  ctx.save();
  ctx.strokeStyle = template.accentColor;
  ctx.lineWidth = 4;
  ctx.globalAlpha = 0.35;
  ctx.strokeRect(inset, inset, A4_WIDTH - inset * 2, A4_HEIGHT - inset * 2);

  // Inner subtle border
  ctx.lineWidth = 1.5;
  ctx.globalAlpha = 0.2;
  const innerInset = 76;
  ctx.strokeRect(innerInset, innerInset, A4_WIDTH - innerInset * 2, A4_HEIGHT - innerInset * 2);
  ctx.restore();
}

function drawPillBadge(ctx: CanvasRenderingContext2D, text: string, accentColor: string, textColor: string) {
  ctx.save();
  ctx.font = 'bold 32px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  const textWidth = ctx.measureText(text).width;
  const badgeWidth = textWidth + 120;
  const badgeHeight = 68;
  const badgeX = (A4_WIDTH - badgeWidth) / 2;
  const badgeY = 140;

  // Pill background
  ctx.beginPath();
  drawRoundedRect(ctx, badgeX, badgeY, badgeWidth, badgeHeight, 34);
  ctx.fillStyle = accentColor;
  ctx.globalAlpha = 0.15;
  ctx.fill();

  // Pill border
  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 2.5;
  ctx.globalAlpha = 0.8;
  ctx.stroke();

  // Text
  ctx.globalAlpha = 1;
  ctx.fillStyle = accentColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, A4_WIDTH / 2, badgeY + badgeHeight / 2 + 2);
  ctx.restore();
}

function drawQRCard(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  data: A4PosterData,
  template: A4Template
) {
  ctx.save();

  // Drop Shadow
  ctx.shadowColor = 'rgba(0, 0, 0, 0.16)';
  ctx.shadowBlur = 60;
  ctx.shadowOffsetY = 24;

  // Background Card
  ctx.beginPath();
  drawRoundedRect(ctx, x, y, w, h, 48);
  ctx.fillStyle = template.cardBg || '#ffffff';
  ctx.fill();

  // Border
  ctx.shadowColor = 'transparent';
  ctx.lineWidth = 5;
  ctx.strokeStyle = template.cardBorder || 'rgba(0, 0, 0, 0.08)';
  ctx.stroke();

  // Card Header Label: "POINT SMARTPHONE CAMERA HERE"
  ctx.font = 'bold 30px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = template.accentColor;
  ctx.textAlign = 'center';
  ctx.fillText('⚡ POINT CAMERA TO READ INTERACTIVE FLIPBOOK', x + w / 2, y + 64);

  // Card Footer URL Pill: e.whizpoint.app/[slug]
  const pillY = y + h - 110;
  const pillHeight = 64;
  const displayUrl = data.url.replace(/^https?:\/\//, '');

  ctx.font = 'bold 32px "SF Mono", Consolas, monospace';
  const urlWidth = ctx.measureText(displayUrl).width;
  const pillWidth = Math.min(w - 120, urlWidth + 80);
  const pillX = x + (w - pillWidth) / 2;

  ctx.beginPath();
  drawRoundedRect(ctx, pillX, pillY, pillWidth, pillHeight, 32);
  ctx.fillStyle = 'rgba(15, 23, 42, 0.06)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(15, 23, 42, 0.12)';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = '#0f172a';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(displayUrl, x + w / 2, pillY + pillHeight / 2);

  ctx.restore();
}

function drawSunriseSunset(
  ctx: CanvasRenderingContext2D,
  y: number,
  sunrise?: string,
  sunset?: string,
  template?: A4Template
) {
  const sunriseText = sunrise ? `SUNRISE: ${sunrise}` : 'SUNRISE: 12 JAN 1954';
  const sunsetText = sunset ? `SUNSET: ${sunset}` : 'SUNSET: 08 NOV 2026';

  ctx.save();
  ctx.textAlign = 'center';
  ctx.font = 'bold 42px -apple-system, BlinkMacSystemFont, Georgia, serif';
  ctx.fillStyle = template?.accentColor || '#d97706';

  const combined = `🌅  ${sunriseText}   •   🌇  ${sunsetText}`;
  ctx.fillText(combined, A4_WIDTH / 2, y);
  ctx.restore();
}

function drawHostingNotice(ctx: CanvasRenderingContext2D, slug: string) {
  ctx.save();
  const noticeY = A4_HEIGHT - 170;

  // Divider line
  ctx.beginPath();
  ctx.moveTo(320, noticeY - 40);
  ctx.lineTo(A4_WIDTH - 320, noticeY - 40);
  ctx.strokeStyle = 'rgba(100, 116, 139, 0.35)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Main system line
  ctx.textAlign = 'center';
  ctx.font = 'bold 26px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = '#475569';
  ctx.fillText(
    'WHIZPOINT FLIPBOOK DIGITAL PUBLISHING ENGINE  •  OFFICIAL VERIFIED PUBLICATION',
    A4_WIDTH / 2,
    noticeY
  );

  // Temporary hosting & archival contact notice
  ctx.font = '24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = '#64748b';
  ctx.fillText(
    'Cloud Hosting Window Active. For Permanent Archival or Re-Hosting inquiries, contact: WhatsApp +254 754 783 683  •  support@whizpoint.app',
    A4_WIDTH / 2,
    noticeY + 40
  );

  // URL line
  ctx.font = '22px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText(`e.whizpoint.app/${slug}  •  whizpoint.app`, A4_WIDTH / 2, noticeY + 76);

  ctx.restore();
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
}

function drawArch(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  const r = w / 2;
  ctx.moveTo(x, y + h);
  ctx.lineTo(x, y + r);
  ctx.arc(x + r, y + r, r, Math.PI, 0, false);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x, y + h);
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  const words = text.split(' ');
  let line = '';
  let currentY = y;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line.trim(), x, currentY);
      line = words[n] + ' ';
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line.trim(), x, currentY);
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

// ---------------------------------------------------------------------------
// EXPORT DISPATCHERS (PDF, PNG, PRINT)
// ---------------------------------------------------------------------------

/**
 * Downloads the A4 Poster as a high-resolution 300 DPI PDF with Whizpoint metadata
 */
export async function downloadA4PDF(data: A4PosterData) {
  const canvas = await renderA4PosterToCanvas(data);
  const imgData = canvas.toDataURL('image/jpeg', 0.95);

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  // Whizpoint System Metadata (Avoid any 3rd party attribution)
  pdf.setProperties({
    title: `${data.documentTitle} - Whizpoint A4 Standee`,
    subject: 'Whizpoint Flipbook Interactive Publication Standee / QR Poster',
    author: 'Whizpoint Solutions (https://whizpoint.app)',
    keywords: 'Whizpoint, Flipbook, A4 Poster, QR Code, Digital Publishing',
    creator: 'Whizpoint Digital Publishing Engine (e.whizpoint.app)',
  });

  // 210mm x 297mm full bleed
  pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
  
  const cleanTitle = (data.documentTitle || 'Publication').replace(/[^a-zA-Z0-9_-]/g, '_');
  pdf.save(`Whizpoint-A4-${cleanTitle}.pdf`);
}

/**
 * Downloads the A4 Poster as an Ultra-HD 300 DPI PNG
 */
export async function downloadA4PNG(data: A4PosterData) {
  const canvas = await renderA4PosterToCanvas(data);
  const url = canvas.toDataURL('image/png', 1.0);
  const a = document.createElement('a');
  a.href = url;
  const cleanTitle = (data.documentTitle || 'Publication').replace(/[^a-zA-Z0-9_-]/g, '_');
  a.download = `Whizpoint-A4-${cleanTitle}-300DPI.png`;
  a.click();
}

/**
 * Opens the browser native print dialog with the exact A4 layout
 */
export async function printA4Poster(data: A4PosterData) {
  const canvas = await renderA4PosterToCanvas(data);
  const imgData = canvas.toDataURL('image/png', 1.0);

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to open the print dialog.');
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Print ${data.documentTitle} - Whizpoint Flipbook</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 0;
          }
          body {
            margin: 0;
            padding: 0;
            background: #ffffff;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          img {
            width: 100vw;
            height: 100vh;
            object-fit: contain;
          }
        </style>
      </head>
      <body>
        <img src="${imgData}" onload="window.print(); window.close();" />
      </body>
    </html>
  `);
  printWindow.document.close();
}
