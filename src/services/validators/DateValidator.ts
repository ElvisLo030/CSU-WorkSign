import type { IValidator, MinguoDate, ValidationResult } from '../../types/index.js';

export class DateValidator implements IValidator<MinguoDate> {
  validate(value: MinguoDate): ValidationResult {
    const { year, month, day } = value;

    if (!Number.isInteger(year) || year < 80 || year > 130) {
      return { isValid: false, errorMessage: '民國年份請輸入 80–130 之間的整數' };
    }

    if (!Number.isInteger(month) || month < 1 || month > 12) {
      return { isValid: false, errorMessage: '月份請輸入 1–12 之間的整數' };
    }

    const maxDay = this.daysInMonth(month, year + 1911);
    if (!Number.isInteger(day) || day < 1 || day > maxDay) {
      return { isValid: false, errorMessage: `${month} 月最多 ${maxDay} 天` };
    }

    return { isValid: true, errorMessage: null };
  }

  private daysInMonth(month: number, westernYear: number): number {
    return new Date(westernYear, month, 0).getDate();
  }
}
