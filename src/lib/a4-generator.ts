import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
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
  // Sizing & Positioning Controls
  titleFontSize?: number; // 48 - 110 (default 82)
  qrSize?: number;        // 800 - 1650 (default 1360 without photo, 1120 with photo)
  qrCardOffsetY?: number; // -250 to +250 (default 0)
  photoSize?: number;     // 240 - 650 (default 460)
  showBadge?: boolean;
  showPhoto?: boolean;
  showSunriseSunset?: boolean;
  showBottomNote?: boolean;
  // Photo
  photoUrl?: string | null;
  photoShape?: 'circle' | 'arch' | 'rounded' | 'none';
  // Custom Background & Transparency
  customBgUrl?: string | null;
  customBgOpacity?: number; // 0.1 to 1.0 (default 0.6)
  // QR image data url
  qrDataUrl?: string;
  centerLogoUrl?: string | null;
  qrLogoSize?: number;
  customQrColor?: string;
  // Hosting notice (mandated for non-pro)
  showHostingNotice?: boolean;
  isProUser?: boolean;
}

// 300 DPI A4 Dimensions (210mm x 297mm @ 300 DPI)
export const A4_WIDTH = 2480;
export const A4_HEIGHT = 3508;

/**
 * Generates an ultra-crisp, 100% reliable QR code canvas with center logo and high error correction (H)
 */
export async function generateReliableQRCanvas(
  url: string,
  color: string,
  logoUrl?: string | null,
  logoSizePercent: number = 0.28
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  canvas.width = 1500;
  canvas.height = 1500;

  // Render high-res vector QR with Level H (30% error correction)
  await QRCode.toCanvas(canvas, url, {
    width: 1500,
    margin: 3,
    errorCorrectionLevel: 'H',
    color: {
      dark: color || '#0f172a',
      light: '#ffffff',
    },
  });

  // Draw Center Logo if provided
  if (logoUrl) {
    try {
      const logoImg = await loadImage(logoUrl);
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const logoBoxSize = Math.round(1500 * (logoSizePercent || 0.28));
        const logoBoxX = (1500 - logoBoxSize) / 2;
        const logoBoxY = (1500 - logoBoxSize) / 2;

        // White background pill/square with border for contrast
        ctx.save();
        ctx.beginPath();
        drawRoundedRect(ctx, logoBoxX, logoBoxY, logoBoxSize, logoBoxSize, Math.round(logoBoxSize * 0.22));
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.18)';
        ctx.shadowBlur = 24;
        ctx.fill();

        ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.lineWidth = 6;
        ctx.stroke();

        // Clip and draw logo image
        ctx.clip();
        const padding = Math.round(logoBoxSize * 0.08);
        ctx.drawImage(
          logoImg,
          logoBoxX + padding,
          logoBoxY + padding,
          logoBoxSize - padding * 2,
          logoBoxSize - padding * 2
        );
        ctx.restore();
      }
    } catch (err) {
      console.warn('Failed to draw logo on QR code, continuing with clean QR:', err);
    }
  }

  return canvas;
}

/**
 * Renders the entire A4 poster onto a 2480x3508 canvas at 300 DPI with balanced proportions
 */
export async function renderA4PosterToCanvas(data: A4PosterData): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  canvas.width = A4_WIDTH;
  canvas.height = A4_HEIGHT;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get 2D canvas context');

  const { template } = data;

  // 1. Draw Base Template Gradient
  drawFallbackGradient(ctx, template.bgGradient);

  // 2. Draw Custom Background Image with Adjustable Transparency (Blending with Gradient)
  if (data.customBgUrl) {
    try {
      const customImg = await loadImage(data.customBgUrl);
      ctx.save();
      ctx.globalAlpha = typeof data.customBgOpacity === 'number' ? data.customBgOpacity : 0.6;
      ctx.drawImage(customImg, 0, 0, A4_WIDTH, A4_HEIGHT);
      ctx.restore();
    } catch (e) {
      console.warn('Failed to draw custom background image:', e);
    }
  }

  // Draw decorative outer frame
  drawDecorativeFrame(ctx, template);

  let currentY = 120;

  // 3. Draw Top Badge (if enabled)
  const badgeText = (data.badgeText || template.badgeText || '').toUpperCase();
  if (data.showBadge !== false && badgeText) {
    drawPillBadge(ctx, badgeText, template.accentColor, template.textColor, currentY);
    currentY += 150;
  } else {
    currentY += 60;
  }

  // 4. Draw Header Titles
  const mainTitle = data.customTitle || template.defaultTitle;
  const subtitle = data.customSubtitle || template.defaultSubtitle;
  const titleSize = data.titleFontSize || 82;

  // Main Title
  ctx.save();
  ctx.textAlign = 'center';
  ctx.fillStyle = template.titleColor;
  ctx.font = template.fontFamily === 'serif' 
    ? `bold ${titleSize}px "Times New Roman", Georgia, serif`
    : `bold ${titleSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;

  wrapText(ctx, mainTitle, A4_WIDTH / 2, currentY, A4_WIDTH - 380, titleSize * 1.25);
  currentY += titleSize * 1.35;

  // Person Name (if memorial / wedding / spotlight)
  if (data.personName && data.personName.trim()) {
    const nameSize = Math.max(76, Math.round(titleSize * 1.2));
    ctx.font = template.fontFamily === 'serif'
      ? `italic bold ${nameSize}px Georgia, serif`
      : `bold ${nameSize}px -apple-system, BlinkMacSystemFont, sans-serif`;
    ctx.fillStyle = template.accentColor;
    ctx.fillText(data.personName.trim(), A4_WIDTH / 2, currentY);
    currentY += nameSize * 1.3;
  }

  // Subtitle
  if (subtitle && subtitle.trim()) {
    ctx.font = '40px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = template.subtitleColor;
    wrapText(ctx, subtitle, A4_WIDTH / 2, currentY, A4_WIDTH - 460, 56);
    currentY += 80;
  }
  ctx.restore();

  // 5. Optional Portrait Photo
  const hasPhoto = data.showPhoto !== false && Boolean(data.photoUrl) && data.photoShape !== 'none';
  if (hasPhoto && data.photoUrl) {
    try {
      const photoImg = await loadImage(data.photoUrl);
      const photoSize = data.photoSize || 460;
      const photoX = (A4_WIDTH - photoSize) / 2;
      const photoY = currentY + 15;

      ctx.save();
      ctx.beginPath();
      if (data.photoShape === 'arch') {
        drawArch(ctx, photoX, photoY, photoSize, photoSize);
      } else if (data.photoShape === 'circle') {
        ctx.arc(photoX + photoSize / 2, photoY + photoSize / 2, photoSize / 2, 0, Math.PI * 2);
      } else {
        drawRoundedRect(ctx, photoX, photoY, photoSize, photoSize, 40);
      }
      ctx.closePath();

      // Shadow
      ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
      ctx.shadowBlur = 40;
      ctx.shadowOffsetY = 16;
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
      } else if (data.photoShape === 'circle') {
        ctx.arc(photoX + photoSize / 2, photoY + photoSize / 2, photoSize / 2, 0, Math.PI * 2);
      } else {
        drawRoundedRect(ctx, photoX, photoY, photoSize, photoSize, 40);
      }
      ctx.stroke();
      ctx.restore();

      currentY += photoSize + 60;
    } catch (e) {
      console.warn('Failed to draw portrait photo:', e);
    }
  }

  // 6. Centered Hero QR Card (PROPORTIONALLY LARGE)
  const defaultCalculatedQrSize = hasPhoto ? 1120 : 1360;
  const chosenQrSize = data.qrSize || defaultCalculatedQrSize;
  
  // Card dimensions
  const cardPaddingX = 180;
  const qrCardWidth = Math.min(A4_WIDTH - 240, chosenQrSize + cardPaddingX * 2);
  const qrCardHeight = chosenQrSize + 340;
  const qrCardX = (A4_WIDTH - qrCardWidth) / 2;
  
  // Dynamic Y positioning: Starts right below header/photo
  const baseCardY = hasPhoto ? currentY + 30 : Math.max(currentY + 40, 680);
  const qrCardY = Math.max(300, baseCardY + (data.qrCardOffsetY || 0));

  drawQRCard(ctx, qrCardX, qrCardY, qrCardWidth, qrCardHeight, data, template);

  // 7. Load and Draw QR Code Image (Guaranteed Non-Empty Fallback)
  const qrX = qrCardX + (qrCardWidth - chosenQrSize) / 2;
  const qrY = qrCardY + 110;
  let qrDrawn = false;

  // Try using data.qrDataUrl first if provided
  if (data.qrDataUrl && data.qrDataUrl.length > 100) {
    try {
      const qrImg = await loadImage(data.qrDataUrl);
      ctx.drawImage(qrImg, qrX, qrY, chosenQrSize, chosenQrSize);
      qrDrawn = true;
    } catch (err) {
      console.warn('Failed to load pre-rendered QR dataUrl, falling back to reliable canvas:', err);
    }
  }

  // If not drawn yet, generate directly with QRCode.toCanvas
  if (!qrDrawn) {
    try {
      const qrColor = data.customQrColor || template.qrColor || '#0f172a';
      const fallbackCanvas = await generateReliableQRCanvas(
        data.url,
        qrColor,
        data.centerLogoUrl,
        data.qrLogoSize || 0.28
      );
      ctx.drawImage(fallbackCanvas, qrX, qrY, chosenQrSize, chosenQrSize);
      qrDrawn = true;
    } catch (fallbackErr) {
      console.error('Critical failure in fallback QR generation:', fallbackErr);
    }
  }

  // 8. Bottom Section (Sunrise/Sunset, Quotes & Archival)
  let bottomY = qrCardY + qrCardHeight + 70;

  // Sunrise & Sunset (NO EMOJIS — Pure Classic Typography)
  const shouldShowDates = data.showSunriseSunset !== false && (template.category === 'memorial' || template.showSunriseSunset);
  if (shouldShowDates) {
    drawSunriseSunset(ctx, bottomY, data.sunriseDate, data.sunsetDate, template);
    bottomY += 120;
  }

  // Bottom Note / Quote
  const noteText = data.bottomNote || template.defaultBottomNote;
  if (data.showBottomNote !== false && noteText) {
    ctx.save();
    ctx.textAlign = 'center';
    ctx.fillStyle = template.textColor;
    ctx.font = template.fontFamily === 'serif' 
      ? 'italic 40px Georgia, serif' 
      : '38px -apple-system, BlinkMacSystemFont, sans-serif';
    wrapText(ctx, noteText, A4_WIDTH / 2, bottomY, A4_WIDTH - 400, 56);
    ctx.restore();
  }

  // 9. Whizpoint Archival & Temporary Hosting Notice (Mandatory for Non-Pro)
  const isNoticeMandatory = !data.isProUser;
  if (isNoticeMandatory || data.showHostingNotice !== false) {
    drawHostingNotice(ctx, data.slug);
  }

  return canvas;
}

// ---------------------------------------------------------------------------
// DRAWING HELPERS (NO EMOJIS)
// ---------------------------------------------------------------------------

function drawFallbackGradient(ctx: CanvasRenderingContext2D, bgGradient: string) {
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

function drawPillBadge(
  ctx: CanvasRenderingContext2D,
  text: string,
  accentColor: string,
  textColor: string,
  badgeY: number
) {
  ctx.save();
  ctx.font = 'bold 30px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  const textWidth = ctx.measureText(text).width;
  const badgeWidth = textWidth + 120;
  const badgeHeight = 64;
  const badgeX = (A4_WIDTH - badgeWidth) / 2;

  // Pill background
  ctx.beginPath();
  drawRoundedRect(ctx, badgeX, badgeY, badgeWidth, badgeHeight, 32);
  ctx.fillStyle = accentColor;
  ctx.globalAlpha = 0.14;
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
  ctx.shadowColor = 'rgba(0, 0, 0, 0.18)';
  ctx.shadowBlur = 70;
  ctx.shadowOffsetY = 28;

  // Background Card
  ctx.beginPath();
  drawRoundedRect(ctx, x, y, w, h, 56);
  ctx.fillStyle = template.cardBg || '#ffffff';
  ctx.fill();

  // Border
  ctx.shadowColor = 'transparent';
  ctx.lineWidth = 5;
  ctx.strokeStyle = template.cardBorder || 'rgba(0, 0, 0, 0.08)';
  ctx.stroke();

  // Card Header Prompt (NO EMOJIS)
  ctx.font = 'bold 34px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = template.accentColor;
  ctx.textAlign = 'center';
  ctx.fillText('POINT CAMERA TO READ', x + w / 2, y + 74);

  // Card Footer URL Pill: e.whizpoint.app/[slug]
  const pillY = y + h - 120;
  const pillHeight = 70;
  const displayUrl = data.url.replace(/^https?:\/\//, '');

  ctx.font = 'bold 36px "SF Mono", Consolas, monospace';
  const urlWidth = ctx.measureText(displayUrl).width;
  const pillWidth = Math.min(w - 140, urlWidth + 100);
  const pillX = x + (w - pillWidth) / 2;

  ctx.beginPath();
  drawRoundedRect(ctx, pillX, pillY, pillWidth, pillHeight, 35);
  ctx.fillStyle = 'rgba(15, 23, 42, 0.06)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(15, 23, 42, 0.12)';
  ctx.lineWidth = 2.5;
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
  const sunriseText = sunrise ? `SUNRISE: ${sunrise.toUpperCase()}` : 'SUNRISE: 12 JAN 1954';
  const sunsetText = sunset ? `SUNSET: ${sunset.toUpperCase()}` : 'SUNSET: 08 NOV 2026';

  ctx.save();
  ctx.textAlign = 'center';
  ctx.font = 'bold 44px -apple-system, BlinkMacSystemFont, Georgia, serif';
  ctx.fillStyle = template?.accentColor || '#d97706';

  // NO EMOJIS — Classic typographic em-dash
  const combined = `${sunriseText}   —   ${sunsetText}`;
  ctx.fillText(combined, A4_WIDTH / 2, y);
  ctx.restore();
}

function drawHostingNotice(ctx: CanvasRenderingContext2D, slug: string) {
  ctx.save();
  const noticeY = A4_HEIGHT - 170;

  // Divider line
  ctx.beginPath();
  ctx.moveTo(300, noticeY - 45);
  ctx.lineTo(A4_WIDTH - 300, noticeY - 45);
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
