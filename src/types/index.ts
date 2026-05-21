// ── 驗證器介面（LSP / ISP / DIP）────────────────────────────────────
export interface IValidator<T> {
  validate(value: T): ValidationResult;
}

export interface ValidationResult {
  readonly isValid: boolean;
  readonly errorMessage: string | null;
}

// ── 表單資料──────────────────────────────────────────────────────────
export interface ConsentFormData {
  readonly idNumber: string;
  readonly minguoYear: number;
  readonly month: number;
  readonly day: number;
}

// ── 民國日期──────────────────────────────────────────────────────────
export interface MinguoDate {
  readonly year: number;
  readonly month: number;
  readonly day: number;
}

// ── 簽名服務介面（ISP：分離初始化、清除、匯出）────────────────────
export interface ISignatureService {
  initialize(canvas: HTMLCanvasElement): void;
  clear(): void;
  exportAsPng(): string | null;
  isEmpty(): boolean;
}

// ── PDF 合成介面（ISP：合成與下載分離）──────────────────────────────
export interface IPdfComposer {
  compose(formData: ConsentFormData, signatureDataUrl: string): Promise<Uint8Array>;
}

export interface IPdfDownloader {
  download(pdfBytes: Uint8Array, filename: string): Promise<void>;
  share(pdfBytes: Uint8Array, filename: string): Promise<void>;
}
