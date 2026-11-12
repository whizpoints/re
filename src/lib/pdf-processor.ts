export type DocumentFormatMode = 'auto' | 'a3-booklet' | 'a4-direct';

export interface ProcessPdfOptions {
  format?: DocumentFormatMode;
  onProgress?: (message: string, current: number, total: number) => void;
}

export interface ProcessPdfResult {
  pages: string[];
  detectedFormat: 'a3-booklet' | 'a4-direct';
  pageCount: number;
  originalSheetCount: number;
}

/**
 * Extracts and formats PDF pages.
 * - 'a3-booklet': Splits A3 landscape spreads into two A4 pages and imposes booklet order (1, 2, 3...).
 * - 'a4-direct': Extracts single pages directly 1:1 without splitting.
 * - 'auto': Detects based on page 1 aspect ratio (width > height * 1.15 = A3 booklet, else A4 direct).
 */
export async function processPdf(
  file: File,
  options: ProcessPdfOptions = {}
): Promise<ProcessPdfResult> {
  const { format = 'auto', onProgress } = options;

  const pdfjsLib = await import('pdfjs-dist');
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const numPages = pdf.numPages;

  if (numPages === 0) {
    throw new Error('PDF file has no pages.');
  }

  // Detect format from first page dimensions
  const firstPage = await pdf.getPage(1);
  const unscaled = firstPage.getViewport({ scale: 1.0 });
  const isLandscape = unscaled.width > unscaled.height * 1.15;

  let chosenFormat: 'a3-booklet' | 'a4-direct' = 'a3-booklet';
  if (format === 'auto') {
    chosenFormat = isLandscape ? 'a3-booklet' : 'a4-direct';
  } else {
    chosenFormat = format;
  }

  if (chosenFormat === 'a3-booklet') {
    // A3 Booklet Spread Mode: Each sheet produces 2 sequential A4 pages
    const N = numPages * 2;
    const pagesArray: string[] = new Array(N).fill('');

    for (let i = 0; i < numPages; i++) {
      if (onProgress) {
        onProgress(`Extracting booklet spread ${i + 1} of ${numPages}...`, i + 1, numPages);
      }

      const page = await pdf.getPage(i + 1);
      const unscaledViewport = page.getViewport({ scale: 1.0 });
      // 3200px total spread width = super crisp 1600px per A4 page
      const scale = 3200 / unscaledViewport.width;
      const viewport = page.getViewport({ scale });

      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      if (context) {
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        await page.render({ canvasContext: context, viewport }).promise;

        // Split A3 canvas down the middle into two A4 pages
        const halfWidth = canvas.width / 2;
        const height = canvas.height;

        const leftCanvas = document.createElement('canvas');
        leftCanvas.width = halfWidth;
        leftCanvas.height = height;
        leftCanvas.getContext('2d')?.drawImage(
          canvas,
          0, 0, halfWidth, height,
          0, 0, halfWidth, height
        );

        const rightCanvas = document.createElement('canvas');
        rightCanvas.width = halfWidth;
        rightCanvas.height = height;
        rightCanvas.getContext('2d')?.drawImage(
          canvas,
          halfWidth, 0, halfWidth, height,
          0, 0, halfWidth, height
        );

        const leftData = leftCanvas.toDataURL('image/jpeg', 0.88);
        const rightData = rightCanvas.toDataURL('image/jpeg', 0.88);

        // Imposition logic for folded booklet spreads:
        // Spread 0 (Outer): Left = Back Cover (N), Right = Front Cover (1)
        // Spread 1 (Inner): Left = Page 2, Right = Page N-1
        // Spread 2 (Next):  Left = Page N-2, Right = Page 3 ...
        if (i % 2 === 0) {
          pagesArray[N - i - 1] = leftData;
          pagesArray[i] = rightData;
        } else {
          pagesArray[i] = leftData;
          pagesArray[N - i - 1] = rightData;
        }
      }
    }

    return {
      pages: pagesArray.filter(Boolean),
      detectedFormat: 'a3-booklet',
      pageCount: N,
      originalSheetCount: numPages,
    };
  } else {
    // Standard A4 / Single Page Mode: Direct 1:1 extraction without splitting
    const pagesArray: string[] = [];

    for (let i = 1; i <= numPages; i++) {
      if (onProgress) {
        onProgress(`Extracting page ${i} of ${numPages}...`, i, numPages);
      }

      const page = await pdf.getPage(i);
      const unscaledViewport = page.getViewport({ scale: 1.0 });
      // Standard A4 crisp scale: 1600px width
      const scale = 1600 / unscaledViewport.width;
      const viewport = page.getViewport({ scale });

      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      if (context) {
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        await page.render({ canvasContext: context, viewport }).promise;
        pagesArray.push(canvas.toDataURL('image/jpeg', 0.88));
      }
    }

    return {
      pages: pagesArray,
      detectedFormat: 'a4-direct',
      pageCount: numPages,
      originalSheetCount: numPages,
    };
  }
}
