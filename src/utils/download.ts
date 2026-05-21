import type { IPdfDownloader } from '../types/index.js';

export class PdfDownloader implements IPdfDownloader {
  async download(pdfBytes: Uint8Array, filename: string): Promise<void> {
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });

    // 優先使用 Web Share API（iOS 15+ / Android Chrome 89+ 支援分享檔案）
    if (typeof navigator.canShare === 'function' && typeof navigator.share === 'function') {
      const file = new File([blob], filename, { type: 'application/pdf' });
      if (navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title: filename });
          return;
        } catch (err) {
          // 使用者取消分享，不視為錯誤
          if ((err as DOMException).name === 'AbortError') return;
          // 其他錯誤則 fallback 到 anchor 下載
        }
      }
    }

    // Fallback：建立隱藏 anchor 觸發下載（桌面瀏覽器 / 舊版 Safari）
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    // 立即釋放，避免記憶體洩漏
    URL.revokeObjectURL(url);
  }
}
