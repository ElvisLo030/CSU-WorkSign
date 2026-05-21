import SignaturePad from 'signature_pad';
import type { ISignatureService } from '../types/index.js';

export class SignatureService implements ISignatureService {
  private pad: SignaturePad | null = null;
  private canvas: HTMLCanvasElement | null = null;

  initialize(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;
    // 先設定 HiDPI 尺寸，再建立 SignaturePad，避免初始化後尺寸被覆寫
    this.applyHiDpi();

    this.pad = new SignaturePad(canvas, {
      penColor: '#000000',
      backgroundColor: 'rgba(0,0,0,0)',
    });

    window.addEventListener('resize', () => this.resizeCanvas());

    // 明確阻止 touchmove 觸發頁面滾動，補強 CSS touch-action:none 在 LINE WebView 的不足
    canvas.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
  }

  clear(): void {
    this.pad?.clear();
  }

  exportAsPng(): string | null {
    if (!this.canvas || this.isEmpty() || !this.pad) return null;

    const ratio = Math.max(window.devicePixelRatio ?? 1, 1);
    const data = this.pad.toData();

    // 計算所有筆跡點的 bounding box（CSS 像素座標）
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const stroke of data) {
      for (const pt of stroke.points) {
        if (pt.x < minX) minX = pt.x;
        if (pt.y < minY) minY = pt.y;
        if (pt.x > maxX) maxX = pt.x;
        if (pt.y > maxY) maxY = pt.y;
      }
    }

    // 加上 8 CSS px padding，避免筆跡邊緣被裁切
    const PAD = 8;
    minX = Math.max(0, minX - PAD);
    minY = Math.max(0, minY - PAD);
    maxX = Math.min(this.canvas.offsetWidth, maxX + PAD);
    maxY = Math.min(this.canvas.offsetHeight, maxY + PAD);

    // 轉換為物理像素座標（HiDPI 縮放）
    const srcX = minX * ratio;
    const srcY = minY * ratio;
    const srcW = (maxX - minX) * ratio;
    const srcH = (maxY - minY) * ratio;

    // 建立固定比例離屏 canvas（與 PDF slot 180×50 pt 比例 3.6:1 相符，放大 3× 保持清晰）
    const offscreen = document.createElement('canvas');
    offscreen.width  = 540; // 180 * 3
    offscreen.height = 150; // 50  * 3
    const ctx = offscreen.getContext('2d');
    if (!ctx) return this.canvas.toDataURL('image/png');

    // contain 模式等比縮放，置中繪製到離屏 canvas
    const scaleX = offscreen.width  / srcW;
    const scaleY = offscreen.height / srcH;
    const scale  = Math.min(scaleX, scaleY);
    const drawW  = srcW * scale;
    const drawH  = srcH * scale;
    const dx = (offscreen.width  - drawW) / 2;
    const dy = (offscreen.height - drawH) / 2;
    ctx.drawImage(this.canvas, srcX, srcY, srcW, srcH, dx, dy, drawW, drawH);

    return offscreen.toDataURL('image/png');
  }

  isEmpty(): boolean {
    return this.pad?.isEmpty() ?? true;
  }

  // 匯出筆跡資料（用於 localStorage 儲存）
  exportData(): object[] {
    return this.pad?.toData() ?? [];
  }

  // 從儲存的筆跡資料還原（恢復 HiDPI 縮放後重繪）
  importData(data: object[]): void {
    if (!this.pad || !data.length) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.pad.fromData(data as any);
  }

  // 設定 CSS 尺寸對應的實體像素（防止 Retina 模糊）
  private applyHiDpi(): void {
    if (!this.canvas) return;
    const ratio = Math.max(window.devicePixelRatio ?? 1, 1);
    this.canvas.width = this.canvas.offsetWidth * ratio;
    this.canvas.height = this.canvas.offsetHeight * ratio;
    const ctx = this.canvas.getContext('2d');
    ctx?.scale(ratio, ratio);
  }

  // 視窗縮放時：保留筆跡資料 → 重設尺寸 → 還原筆跡
  private resizeCanvas(): void {
    if (!this.canvas || !this.pad) return;
    const data = this.pad.toData();
    this.applyHiDpi();
    this.pad.clear();
    this.pad.fromData(data);
  }
}
