import type { IPdfDownloader } from '../types/index.js';

export class PdfDownloader implements IPdfDownloader {
  download(pdfBytes: Uint8Array, filename: string): void {
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    // 立即釋放，避免記憶體洩漏
    URL.revokeObjectURL(url);
  }
}
