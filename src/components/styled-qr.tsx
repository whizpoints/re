'use client';

import { useEffect, useRef } from 'react';
import QRCodeStyling, { Options } from 'qr-code-styling';

export function StyledQR({ 
  url, 
  logoUrl, 
  width = 300,
  dotsType = "extra-rounded",
  cornersType = "extra-rounded",
  color = "#0f172a"
}: { 
  url: string, 
  logoUrl?: string, 
  width?: number,
  dotsType?: "rounded" | "dots" | "classy" | "classy-rounded" | "square" | "extra-rounded",
  cornersType?: "dot" | "square" | "extra-rounded",
  color?: string
}) {
  const ref = useRef<HTMLDivElement>(null);
  const qrCode = useRef<QRCodeStyling | null>(null);

  useEffect(() => {
    const options: Options = {
      width: 2000,
      height: 2000,
      type: 'canvas',
      data: url,
      margin: 10,
      image: logoUrl || '/logo.png',
      dotsOptions: {
        color: color,
        type: dotsType as any
      },
      cornersSquareOptions: {
        color: color,
        type: cornersType as any
      },
      cornersDotOptions: {
        color: color,
        type: cornersType === 'extra-rounded' ? 'dot' : cornersType as any
      },
      imageOptions: {
        crossOrigin: "anonymous",
        margin: 8,
        imageSize: 0.4
      },
      backgroundOptions: {
        color: "#ffffff",
      }
    };

    if (!qrCode.current) {
      qrCode.current = new QRCodeStyling(options);
      if (ref.current) {
        qrCode.current.append(ref.current);
      }
    } else {
      qrCode.current.update(options);
    }
  }, [url, logoUrl, width, dotsType, cornersType, color]);

  return <div ref={ref} className="overflow-hidden rounded-xl bg-white shadow-xl flex items-center justify-center p-2 [&>canvas]:w-full [&>canvas]:max-w-[300px] [&>canvas]:h-auto" />;
}
