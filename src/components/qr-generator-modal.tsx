'use client';

import React, { useState, useRef, useCallback } from 'react';
import { X, Upload, Settings2, Download, Crop as CropIcon } from 'lucide-react';
import { StyledQR } from './styled-qr';
import Cropper from 'react-easy-crop';
import { Point, Area } from 'react-easy-crop';

interface QRGeneratorModalProps {
  url: string;
  onClose: () => void;
  documentTitle: string;
}

export function QRGeneratorModal({ url, onClose, documentTitle }: QRGeneratorModalProps) {
  const [logoUrl, setLogoUrl] = useState<string>('');
  
  // Cropper state
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isCropping, setIsCropping] = useState(false);

  // QR Options
  const [dotsType, setDotsType] = useState<'rounded' | 'dots' | 'classy' | 'classy-rounded' | 'square' | 'extra-rounded'>('extra-rounded');
  const [cornersType, setCornersType] = useState<'dot' | 'square' | 'extra-rounded'>('extra-rounded');
  const [qrColor, setQrColor] = useState('#0f172a'); // slate-900

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImageSrc(reader.result?.toString() || '');
        setIsCropping(true);
      });
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createCroppedImage = async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    try {
      const image = new Image();
      image.src = imageSrc;
      await new Promise(resolve => image.onload = resolve);

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = croppedAreaPixels.width;
      canvas.height = croppedAreaPixels.height;

      // Draw rounded rectangle for clipping
      const radius = Math.min(canvas.width, canvas.height) * 0.2; // 20% border radius
      ctx.beginPath();
      ctx.moveTo(radius, 0);
      ctx.lineTo(canvas.width - radius, 0);
      ctx.quadraticCurveTo(canvas.width, 0, canvas.width, radius);
      ctx.lineTo(canvas.width, canvas.height - radius);
      ctx.quadraticCurveTo(canvas.width, canvas.height, canvas.width - radius, canvas.height);
      ctx.lineTo(radius, canvas.height);
      ctx.quadraticCurveTo(0, canvas.height, 0, canvas.height - radius);
      ctx.lineTo(0, radius);
      ctx.quadraticCurveTo(0, 0, radius, 0);
      ctx.closePath();

      // Fill with white first in case the image is transparent
      ctx.fillStyle = '#ffffff';
      ctx.fill();

      // Clip the region
      ctx.clip();

      ctx.drawImage(
        image,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        croppedAreaPixels.width,
        croppedAreaPixels.height
      );

      // Add a faint inner border to define the rounded edge nicely
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
      ctx.lineWidth = Math.max(2, canvas.width * 0.01);
      ctx.stroke();

      setLogoUrl(canvas.toDataURL('image/png'));
      setIsCropping(false);
      setImageSrc(null);
    } catch (e) {
      console.error('Error cropping image:', e);
    }
  };

  const downloadQR = () => {
    const svg = document.querySelector('.qr-container svg') as SVGSVGElement;
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `QR-${documentTitle.replace(/\s+/g, '-')}.svg`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  if (isCropping && imageSrc) {
    return (
      <div className="fixed inset-0 z-[100] bg-slate-900/90 flex flex-col items-center justify-center p-4 backdrop-blur-sm">
        <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col h-[80vh]">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-900">Crop Logo</h3>
            <button onClick={() => { setIsCropping(false); setImageSrc(null); }} className="text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex-1 relative bg-slate-100">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
              cropShape="rect"
            />
          </div>

          <div className="p-6 bg-white border-t border-slate-100 space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-500 mb-2 block">Zoom</label>
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                aria-labelledby="Zoom"
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            <button 
              onClick={createCroppedImage}
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <CropIcon className="w-4 h-4" /> Apply Crop
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[90] bg-slate-900/60 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl p-4 sm:p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl relative flex flex-col md:flex-row gap-6 md:gap-8">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 z-10 bg-slate-100 rounded-full p-1">
          <X className="w-5 h-5" />
        </button>

        {/* Left Side: QR Preview */}
        <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 rounded-2xl p-8 border border-slate-100 qr-container">
          <StyledQR 
            url={url} 
            logoUrl={logoUrl} 
            width={300} 
            dotsType={dotsType}
            cornersType={cornersType}
            color={qrColor}
          />
        </div>

        {/* Right Side: Options */}
        <div className="flex-1 flex flex-col space-y-6">
          <div>
            <h3 className="text-2xl font-bold text-slate-900 mb-1">QR Code Generator</h3>
            <p className="text-sm text-slate-500">Customize the QR code for "{documentTitle}"</p>
          </div>

          <div className="space-y-5 flex-1 md:overflow-y-auto md:pr-2 custom-scrollbar">
            {/* Logo Upload */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Upload className="w-4 h-4 text-blue-600" /> Center Logo
              </label>
              <div className="flex items-center gap-4">
                {logoUrl && (
                  <div className="w-12 h-12 rounded border border-slate-200 overflow-hidden shrink-0">
                    <img src={logoUrl} alt="Logo preview" className="w-full h-full object-cover" />
                  </div>
                )}
                <label className="flex-1 cursor-pointer group">
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                  <div className="border-2 border-dashed border-slate-200 group-hover:border-blue-400 group-hover:bg-blue-50 rounded-xl px-4 py-3 text-center transition-colors">
                    <span className="text-sm text-slate-600 font-medium group-hover:text-blue-700">
                      {logoUrl ? 'Change Logo' : 'Upload Logo'}
                    </span>
                  </div>
                </label>
                {logoUrl && (
                  <button onClick={() => setLogoUrl('')} className="text-xs text-red-500 hover:text-red-700 font-medium">Remove</button>
                )}
              </div>
            </div>

            {/* Pattern Type */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-blue-600" /> Pattern Style
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['extra-rounded', 'rounded', 'dots', 'classy', 'square'] as const).map(type => (
                  <button
                    key={type}
                    onClick={() => setDotsType(type)}
                    className={`py-2 px-3 rounded-lg border text-sm font-medium capitalize transition-colors ${dotsType === type ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                  >
                    {type.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Eyes Type */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Eyes Style</label>
              <div className="grid grid-cols-3 gap-2">
                {(['extra-rounded', 'square', 'dot'] as const).map(type => (
                  <button
                    key={type}
                    onClick={() => setCornersType(type)}
                    className={`py-2 px-3 rounded-lg border text-sm font-medium capitalize transition-colors ${cornersType === type ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                  >
                    {type.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Picker */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Foreground Color</label>
              <div className="flex items-center gap-3">
                <input 
                  type="color" 
                  value={qrColor} 
                  onChange={(e) => setQrColor(e.target.value)}
                  className="w-10 h-10 rounded border-0 cursor-pointer p-0"
                />
                <span className="text-sm text-slate-500 font-mono uppercase">{qrColor}</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <button 
              onClick={downloadQR}
              className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <Download className="w-5 h-5" /> Download Premium QR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
