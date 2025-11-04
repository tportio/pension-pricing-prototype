import type { Season, DateRange, RecurrencePattern } from '../types';

/**
 * 날짜가 시즌의 기간에 포함되는지 확인 (반복 패턴 고려)
 */
export function isDateInSeason(date: Date, season: Season): boolean {
  const dateStr = formatDate(date);
  const year = date.getFullYear();

  // 기본 요금(비수기)는 항상 true
  if (season.isDefault) {
    return true;
  }

  // dateRanges가 있으면 사용, 없으면 startDate/endDate 사용 (하위 호환성)
  const ranges = season.dateRanges || [
    {
      id: 'legacy',
      startDate: season.startDate,
      endDate: season.endDate,
    },
  ];

  // 반복 설정이 있으면 적용
  if (season.recurrence && season.recurrence.type === 'yearly') {
    const expandedRanges = expandRecurrencePattern(ranges, season.recurrence, year);
    return expandedRanges.some(range =>
      dateStr >= range.startDate && dateStr <= range.endDate
    );
  }

  // 반복 설정이 없으면 직접 비교
  return ranges.some(range =>
    dateStr >= range.startDate && dateStr <= range.endDate
  );
}

/**
 * 반복 패턴을 고려하여 특정 연도의 실제 날짜 범위 생성
 */
export function expandRecurrencePattern(
  ranges: DateRange[],
  recurrence: RecurrencePattern,
  targetYear: number
): DateRange[] {
  if (recurrence.type === 'none') {
    return ranges;
  }

  if (recurrence.type === 'yearly') {
    // 시작/종료 연도 체크
    if (recurrence.startYear && targetYear < recurrence.startYear) {
      return [];
    }
    if (recurrence.endYear && targetYear > recurrence.endYear) {
      return [];
    }

    // 월-일만 추출하여 targetYear로 변환
    return ranges.map(range => {
      const startMonthDay = range.startDate.substring(5); // MM-DD
      const endMonthDay = range.endDate.substring(5); // MM-DD

      return {
        ...range,
        startDate: `${targetYear}-${startMonthDay}`,
        endDate: `${targetYear}-${endMonthDay}`,
      };
    });
  }

  return ranges;
}

/**
 * 두 날짜 범위가 겹치는지 확인
 */
export function checkDateRangeOverlap(range1: DateRange, range2: DateRange): boolean {
  return (
    (range1.startDate >= range2.startDate && range1.startDate <= range2.endDate) ||
    (range1.endDate >= range2.startDate && range1.endDate <= range2.endDate) ||
    (range1.startDate <= range2.startDate && range1.endDate >= range2.endDate)
  );
}

/**
 * 여러 날짜 범위들 간의 중복 확인
 */
export function checkMultipleDateRangesOverlap(ranges: DateRange[]): boolean {
  for (let i = 0; i < ranges.length; i++) {
    for (let j = i + 1; j < ranges.length; j++) {
      if (checkDateRangeOverlap(ranges[i], ranges[j])) {
        return true;
      }
    }
  }
  return false;
}

/**
 * 시즌 간의 기간 충돌 확인 (반복 패턴 고려)
 */
export function checkSeasonConflict(
  season1: Season,
  season2: Season,
  targetYear?: number
): boolean {
  // 기본 요금끼리는 충돌하지 않음
  if (season1.isDefault || season2.isDefault) {
    return false;
  }

  const year = targetYear || new Date().getFullYear();

  // season1의 실제 범위
  const ranges1 = season1.dateRanges || [{
    id: 'legacy',
    startDate: season1.startDate,
    endDate: season1.endDate,
  }];
  const expandedRanges1 = season1.recurrence
    ? expandRecurrencePattern(ranges1, season1.recurrence, year)
    : ranges1;

  // season2의 실제 범위
  const ranges2 = season2.dateRanges || [{
    id: 'legacy',
    startDate: season2.startDate,
    endDate: season2.endDate,
  }];
  const expandedRanges2 = season2.recurrence
    ? expandRecurrencePattern(ranges2, season2.recurrence, year)
    : ranges2;

  // 모든 조합 확인
  for (const r1 of expandedRanges1) {
    for (const r2 of expandedRanges2) {
      if (checkDateRangeOverlap(r1, r2)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * 퍼센트 기반 가격 계산
 */
export function calculatePriceFromPercentage(basePrice: number, percentage: number): number {
  return Math.round(basePrice * (1 + percentage / 100));
}

/**
 * Date 객체를 YYYY-MM-DD 형식으로 변환
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 시즌이 곧 종료되는지 확인
 */
export function isSeasonNearEnd(season: Season, daysBeforeEnd: number = 30): boolean {
  if (season.isDefault) {
    return false;
  }

  const today = new Date();
  const ranges = season.dateRanges || [{
    id: 'legacy',
    startDate: season.startDate,
    endDate: season.endDate,
  }];

  // 가장 마지막 종료일 찾기
  let latestEndDate: Date | null = null;

  for (const range of ranges) {
    const endDate = new Date(range.endDate);
    if (!latestEndDate || endDate > latestEndDate) {
      latestEndDate = endDate;
    }
  }

  if (!latestEndDate) {
    return false;
  }

  const daysUntilEnd = Math.floor((latestEndDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return daysUntilEnd >= 0 && daysUntilEnd <= daysBeforeEnd;
}

/**
 * 종료 임박 시즌 필터링
 */
export function getSeasonsNearEnd(seasons: Season[], daysBeforeEnd: number = 30): Season[] {
  return seasons.filter(season => isSeasonNearEnd(season, daysBeforeEnd));
}

/**
 * 시즌의 모든 종료일 가져오기 (반복 패턴 고려)
 */
export function getSeasonEndDates(season: Season, years: number[] = [new Date().getFullYear()]): string[] {
  if (season.isDefault) {
    return [];
  }

  const endDates: string[] = [];

  for (const year of years) {
    const ranges = season.dateRanges || [{
      id: 'legacy',
      startDate: season.startDate,
      endDate: season.endDate,
    }];

    const expandedRanges = season.recurrence
      ? expandRecurrencePattern(ranges, season.recurrence, year)
      : ranges;

    expandedRanges.forEach(range => {
      endDates.push(range.endDate);
    });
  }

  return endDates.sort();
}
