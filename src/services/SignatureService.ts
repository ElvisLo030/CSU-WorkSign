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
  }

  clear(): void {
    this.pad?.clear();
  }

  exportAsPng(): string | null {
    if (!this.canvas || this.isEmpty()) return null;
    return this.canvas.toDataURL('image/png');
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
