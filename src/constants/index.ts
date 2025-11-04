import type { QuickPreset } from '../types';

// 이번 주 토요일 날짜 계산
export const getThisSaturday = (): string => {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0(일) ~ 6(토)
  const daysUntilSaturday = (6 - dayOfWeek + 7) % 7 || 7; // 오늘이 토요일이면 다음 토요일
  const saturday = new Date(today);
  saturday.setDate(today.getDate() + daysUntilSaturday);
  return saturday.toISOString().split('T')[0];
};

// 날짜를 "M월 D일" 형식으로 포맷
export const formatDateKorean = (dateStr: string): string => {
  const date = new Date(dateStr);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}월 ${day}일`;
};

// 요일 한글 표시
export const DAY_LABELS = {
  weekday: '주중(월~목)',
  friday: '금요일',
  saturday: '토요일(공휴일 전날)',
  sunday: '일요일',
} as const;

// 채널 한글 표시
export const CHANNEL_LABELS = {
  reservation: '예약창',
  online: '온라인',
} as const;

// 인원 타입 한글 표시
export const PERSON_TYPE_LABELS = {
  adult: '성인',
  child: '아동',
  infant: '유아',
} as const;

// 요일 색상
export const DAY_COLORS = {
  weekday: '#e8f5e9',
  friday: '#fff3e0',
  saturday: '#f0f8ff',
  sunday: '#fff9f9',
} as const;

// 시즌 색상
export const SEASON_COLORS = {
  default: '#e8f5e9',
  low: '#fff3e0',
  medium: '#ffebee',
  high: '#f3e5f5',
} as const;

// 빠른 설정 프리셋 (기본 제공)
export const QUICK_PRESETS: QuickPreset[] = [
  {
    id: 'this-saturday',
    name: '이번 주 토요일',
    type: 'weekend',
    icon: '📅',
    description: '이번 주 토요일 요금 설정',
    isCustom: false,
  },
  {
    id: 'christmas',
    name: '크리스마스',
    type: 'holiday',
    dateRange: {
      start: '2024-12-24',
      end: '2024-12-25',
    },
    icon: '🎄',
    description: '크리스마스 연휴 요금 설정',
    isCustom: false,
  },
  {
    id: 'newyear',
    name: '연말연시',
    type: 'holiday',
    dateRange: {
      start: '2024-12-31',
      end: '2025-01-01',
    },
    icon: '🎉',
    description: '연말연시 요금 설정',
    isCustom: false,
  },
  {
    id: 'chuseok',
    name: '추석 연휴',
    type: 'holiday',
    icon: '🌕',
    description: '추석 연휴 요금 설정',
    isCustom: false,
  },
  {
    id: 'custom',
    name: '커스텀 기간',
    type: 'custom',
    icon: '✏️',
    description: '원하는 기간 설정',
    isCustom: false,
  },
];

// 요금 변경 타입 라벨
export const PRICE_CHANGE_TYPE_LABELS = {
  percentage_increase: '정률 할증',
  percentage_decrease: '정률 할인',
  amount_increase: '정액 할증',
  amount_decrease: '정액 할인',
  fixed: '고정 금액',
} as const;

// 공휴일 목록 (2025년 기준)
export const HOLIDAYS_2024 = [
  '2025-01-01', // 신정
  '2025-03-01', // 삼일절
  '2025-05-05', // 어린이날
  '2025-05-15', // 부처님 오신 날
  '2025-06-06', // 현충일
  '2025-08-15', // 광복절
  '2025-10-05', // 추석 연휴 시작
  '2025-10-06', // 추석
  '2025-10-07', // 추석 연휴
  '2025-10-03', // 개천절
  '2025-10-09', // 한글날
  '2025-12-25', // 크리스마스
];

// 요일 순서
export const DAY_ORDER = ['weekday', 'friday', 'saturday', 'sunday'] as const;
