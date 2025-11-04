import type { PriceChangeType } from '../types';

/**
 * 가격 포맷팅 (천 단위 콤마)
 */
export function formatPrice(price: number): string {
  return price.toLocaleString('ko-KR');
}

/**
 * 가격을 K 단위로 포맷팅 (예: 100,000 → 100K)
 */
export function formatPriceK(price: number): string {
  if (price >= 1000) {
    return `${Math.floor(price / 1000)}K`;
  }
  return formatPrice(price);
}

/**
 * 가격 변경 계산
 */
export function calculatePriceChange(
  originalPrice: number,
  changeType: PriceChangeType,
  value: number
): number {
  switch (changeType) {
    case 'percentage_increase':
      return Math.round(originalPrice * (1 + value / 100));
    case 'percentage_decrease':
      return Math.round(originalPrice * (1 - value / 100));
    case 'amount_increase':
      return originalPrice + value;
    case 'amount_decrease':
      return Math.max(0, originalPrice - value);
    case 'fixed':
      return value;
    default:
      return originalPrice;
  }
}

/**
 * 가격 배열의 최소값
 */
export function getMinPrice(prices: number[]): number {
  if (prices.length === 0) return 0;
  return Math.min(...prices);
}

/**
 * 가격 배열의 최대값
 */
export function getMaxPrice(prices: number[]): number {
  if (prices.length === 0) return 0;
  return Math.max(...prices);
}

/**
 * 가격 배열의 평균값
 */
export function getAvgPrice(prices: number[]): number {
  if (prices.length === 0) return 0;
  const sum = prices.reduce((acc, price) => acc + price, 0);
  return Math.round(sum / prices.length);
}

/**
 * 퍼센트 계산
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

/**
 * 가격 변화율 계산
 */
export function calculatePriceChangeRate(oldPrice: number, newPrice: number): number {
  if (oldPrice === 0) return 0;
  return Math.round(((newPrice - oldPrice) / oldPrice) * 100);
}

/**
 * 원 단위 반올림
 */
export function roundToThousand(price: number): number {
  return Math.round(price / 1000) * 1000;
}

/**
 * 만 단위 반올림
 */
export function roundToTenThousand(price: number): number {
  return Math.round(price / 10000) * 10000;
}
