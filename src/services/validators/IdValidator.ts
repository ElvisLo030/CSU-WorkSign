import type { IValidator, ValidationResult } from '../../types/index.js';

// 字母對應加權值（A=10, B=11 ... Z=33），查表用
const LETTER_VALUES: Readonly<Record<string, number>> = {
  A: 10, B: 11, C: 12, D: 13, E: 14, F: 15, G: 16, H: 17,
  I: 34, J: 18, K: 19, L: 20, M: 21, N: 22, O: 35, P: 23,
  Q: 24, R: 25, S: 26, T: 27, U: 28, V: 29, W: 32, X: 30,
  Y: 31, Z: 33,
};

export class IdValidator implements IValidator<string> {
  validate(value: string): ValidationResult {
    const trimmed = value.trim().toUpperCase();

    if (!this.checkFormat(trimmed)) {
      return { isValid: false, errorMessage: '格式錯誤，請輸入 1 個英文字母加 9 位數字（如：A123456789）' };
    }

    if (!this.checkDigit(trimmed)) {
      return { isValid: false, errorMessage: '身分證字號驗證碼錯誤，請確認輸入是否正確' };
    }

    return { isValid: true, errorMessage: null };
  }

  private checkFormat(value: string): boolean {
    return /^[A-Z][12]\d{8}$/.test(value);
  }

  private checkDigit(value: string): boolean {
    const firstLetter = value[0];
    if (firstLetter === undefined) return false;

    const n = LETTER_VALUES[firstLetter];
    if (n === undefined) return false;

    // 十位數 + 個位數乘以各別加權
    const digits = [Math.floor(n / 10), n % 10];
    for (let i = 1; i < 10; i++) {
      const ch = value[i];
      if (ch === undefined) return false;
      digits.push(parseInt(ch, 10));
    }

    const weights = [1, 9, 8, 7, 6, 5, 4, 3, 2, 1, 1];
    const sum = digits.reduce((acc, d, i) => acc + d * (weights[i] ?? 0), 0);
    return sum % 10 === 0;
  }
}
