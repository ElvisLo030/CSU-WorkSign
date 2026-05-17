import type { MinguoDate } from '../types/index.js';

export function getTodayMinguo(): MinguoDate {
  const today = new Date();
  return {
    year: today.getFullYear() - 1911,
    month: today.getMonth() + 1,
    day: today.getDate(),
  };
}

export function toMinguoYear(westernYear: number): number {
  return westernYear - 1911;
}

export function toWesternYear(minguoYear: number): number {
  return minguoYear + 1911;
}
