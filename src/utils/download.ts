import type { IPdfDownloader } from '../types/index.js';

export class PdfDownloader implements IPdfDownloader {
  // 純 anchor 下載，不使用 Web Share API
  async download(pdfBytes: Uint8Array, filename: string): Promise<void> {
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    // 立即釋放，避免記憶體洩漏
    URL.revokeObjectURL(url);
  }

  // Web Share API 分享，失敗時 fallback 到 anchor 下載
  async share(pdfBytes: Uint8Array, filename: string): Promise<void> {
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const file = new File([blob], filename, { type: 'application/pdf' });

    try {
      await navigator.share({ files: [file], title: filename });
    } catch (err) {
      // 使用者取消分享，不視為錯誤
      if ((err as DOMException).name === 'AbortError') return;
      // 其他錯誤 fallback 到 anchor 下載
      await this.download(pdfBytes, filename);
    }
  }
}
