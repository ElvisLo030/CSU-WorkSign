import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import type { ConsentFormData, IPdfComposer } from '../types/index.js';

// ── 座標設定（pdf-lib 座標系：左下角為原點，向右/上為正）────────────
// 頁面尺寸：A4 595.32 × 841.92 pt（1 pt ≈ 1 px at 72 DPI）
// 以下座標已透過 sips 渲染 + 反覆標記測試確認
const COORDS = {
  // 簽名圖片：立同意書人行（y=220）後方空白處，圖片底部在 y=206
  signature: { x: 315, y: 210, width: 180, height: 50 },
  // 身分證字號：身分證統一編號行（y=185），標籤結束後 x=315
  idNumber:  { x: 350, y: 189, size: 15 },
  // 民國年份：中華民國行（y=152），「中 華 民 國」後方
  year:      { x: 325, y: 152, size: 15 },
  // 月份：「年」字後方
  month:     { x: 418, y: 152, size: 15 },
  // 日期：「月」字後方
  day:       { x: 495, y: 152, size: 15 },
} as const;

function dataUrlToUint8Array(dataUrl: string): Uint8Array {
  const base64 = dataUrl.split(',')[1] ?? '';
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export class PdfService implements IPdfComposer {
  async compose(formData: ConsentFormData, signatureDataUrl: string): Promise<Uint8Array> {
    // 1. 載入範本 PDF（已含同意書全文，不需重新排版中文）
    const templateBytes = await fetch('/form.pdf').then(r => r.arrayBuffer());
    const pdfDoc = await PDFDocument.load(templateBytes);

    // 2. 嵌入 Helvetica（支援 ASCII：英文字母 + 數字，足以顯示 ID 與日期）
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // 3. 嵌入簽名 PNG 圖片
    const pngBytes = dataUrlToUint8Array(signatureDataUrl);
    const signatureImage = await pdfDoc.embedPng(pngBytes);

    // 4. 逐頁填入資料（PDF 可能有 2 頁，兩頁皆填）
    const pages = pdfDoc.getPages();
    for (const page of pages) {
      // pdf-lib 座標系：原點在左下角，y 值向上增加
      // COORDS 中的 y 值直接對應 pdf-lib 原生座標（從頁面底部算起）

      // 簽名圖片
      page.drawImage(signatureImage, {
        x: COORDS.signature.x,
        y: COORDS.signature.y,
        width: COORDS.signature.width,
        height: COORDS.signature.height,
        opacity: 1,
      });

      // 身分證字號
      page.drawText(formData.idNumber, {
        x: COORDS.idNumber.x,
        y: COORDS.idNumber.y,
        size: COORDS.idNumber.size,
        font: helvetica,
        color: rgb(0, 0, 0),
      });

      // 民國年份
      page.drawText(String(formData.minguoYear), {
        x: COORDS.year.x,
        y: COORDS.year.y,
        size: COORDS.year.size,
        font: helvetica,
        color: rgb(0, 0, 0),
      });

      // 月份
      page.drawText(String(formData.month), {
        x: COORDS.month.x,
        y: COORDS.month.y,
        size: COORDS.month.size,
        font: helvetica,
        color: rgb(0, 0, 0),
      });

      // 日期
      page.drawText(String(formData.day), {
        x: COORDS.day.x,
        y: COORDS.day.y,
        size: COORDS.day.size,
        font: helvetica,
        color: rgb(0, 0, 0),
      });
    }

    return pdfDoc.save();
  }
}
