// 채널 타입
export type Channel = 'reservation' | 'online';

// 요일 타입
export type DayType = 'weekday' | 'friday' | 'saturday' | 'sunday';

// 인원 타입
export type PersonType = 'adult' | 'child' | 'infant';

// 객실 정보
export interface Room {
  id: string;
  name: string;
  groupId?: string;
  standardCapacity: number; // 기준 인원
  maxCapacity: number; // 최대 인원
  channels: Channel[]; // 판매 채널
  description?: string;
}

// 객실 그룹
export interface RoomGroup {
  id: string;
  name: string;
  description?: string;
  roomIds: string[];
}

// 요일별 객실 요금
export interface DayPrice {
  weekday: number;
  friday: number;
  saturday: number;
  sunday: number;
}

// 인원추가 요금
export interface ExtraPersonPrice {
  adult: number;
  child: number;
  infant: number;
}

// 요일별 인원추가 요금
export interface DayExtraPersonPrice {
  weekday: ExtraPersonPrice;
  friday: ExtraPersonPrice;
  saturday: ExtraPersonPrice;
  sunday: ExtraPersonPrice;
}

// 날짜 범위 (1개 시즌에 여러 기간 설정 가능)
export interface DateRange {
  id: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
}

// 반복 패턴 타입
export type RecurrenceType = 'none' | 'yearly';

// 반복 패턴 설정
export interface RecurrencePattern {
  type: RecurrenceType;
  startYear?: number; // 시작 연도
  endYear?: number; // 종료 연도 (무제한이면 undefined)
}

// 가격 설정 방식
export type PricingMethod = 'absolute' | 'percentage';

// 가격 설정 구성
export interface PriceConfiguration {
  method: PricingMethod;
  value: number; // absolute면 절대값, percentage면 기본요금 대비 퍼센트
}

// 시즌별 객실 요금
export interface SeasonRoomPrice {
  roomId: string;
  channel: Channel;
  dayPrices: DayPrice;
  extraPersonPrices: DayExtraPersonPrice;
  // 가격 설정 방식 (퍼센트 기반인 경우)
  pricingConfig?: {
    weekday?: PriceConfiguration;
    friday?: PriceConfiguration;
    saturday?: PriceConfiguration;
    sunday?: PriceConfiguration;
  };
}

// 시즌 정보
export interface Season {
  id: string;
  name: string;
  // 하위 호환성을 위해 기존 필드 유지 (deprecated)
  startDate: string; // YYYY-MM-DD - deprecated, use dateRanges
  endDate: string; // YYYY-MM-DD - deprecated, use dateRanges
  // 새로운 다중 기간 필드
  dateRanges?: DateRange[]; // 여러 기간 설정 가능
  // 반복 설정
  recurrence?: RecurrencePattern;
  isDefault?: boolean; // 기본 요금(비수기) 여부
  roomPrices: SeasonRoomPrice[];
  description?: string;
  // 알림 설정
  notifyBeforeDays?: number; // 종료 N일 전 알림
  lastNotifiedAt?: string; // 마지막 알림 시각 (ISO string)
}

// 수동 설정 요금
export interface ManualPrice {
  id: string;
  date: string; // YYYY-MM-DD
  roomId: string;
  channel: Channel;
  price: number;
  extraPersonPrices?: ExtraPersonPrice;
  reason?: string; // 수동 설정 이유
  createdAt: string;
}

// 캘린더 일자별 요금 정보
export interface DailyPriceInfo {
  date: string; // YYYY-MM-DD
  dayOfWeek: DayType;
  isWeekend: boolean;
  isHoliday: boolean;
  isSoldOut: boolean;
  appliedRule: 'manual' | 'season' | 'default';
  seasonId?: string;
  seasonName?: string;
  minPrice: number;
  maxPrice: number;
  avgPrice: number;
  roomPrices: {
    roomId: string;
    roomName: string;
    channel: Channel;
    price: number;
    extraPersonPrices: ExtraPersonPrice;
    appliedRule: 'manual' | 'season' | 'default';
    seasonName?: string;
  }[];
}

// 빠른 설정 프리셋
export interface QuickPreset {
  id: string;
  name: string;
  type: 'holiday' | 'custom' | 'weekend' | 'special';
  dateRange?: {
    start: string;
    end: string;
  };
  icon?: string;
  description?: string;
  isCustom?: boolean; // 사용자가 만든 템플릿 여부
  createdAt?: string; // 생성 일시
}

// 요금 변경 방식
export type PriceChangeType = 'percentage_increase' | 'percentage_decrease' | 'amount_increase' | 'amount_decrease' | 'fixed';

// 빠른 설정 요청
export interface QuickSettingRequest {
  presetId: string;
  dateRange: {
    start: string;
    end: string;
  };
  changeType: PriceChangeType;
  value: number;
  targetRoomIds: string[]; // 전체일 경우 빈 배열
  targetChannels: Channel[];
}

// 월별 통계
export interface MonthlyStats {
  year: number;
  month: number;
  highestRevenueDate: string;
  avgRoomPrice: number;
  totalRevenue: number;
  occupancyRate: number;
}

// 마감 특가 설정
export interface LastMinuteDiscount {
  id: string;
  enabled: boolean;
  daysBeforeCheckIn: number; // 체크인 N일 전
  discountPercentage: number; // 할인율 (%)
  targetChannels: Channel[];
  targetRoomIds: string[]; // 빈 배열이면 전체 객실
}

// 연박 할인 타입
export type ConsecutiveDiscountType = 'amount' | 'percentage';

// 연박 할인 설정
export interface ConsecutiveNightDiscount {
  id: string;
  enabled: boolean;
  nights: number; // N박 이상
  discountType: ConsecutiveDiscountType; // 할인 방식
  discountValue: number; // 할인 금액 또는 퍼센트
  targetChannels: Channel[];
  targetRoomIds: string[]; // 빈 배열이면 전체 객실
  description?: string;
}

// 온라인판매대행 설정 (BP = Business Partner)
export interface OnlinePartnerConfig {
  id: string;
  name: string; // 예: 야놀자, 여기어때
  enabled: boolean;
  commissionRate: number; // 수수료율 (%)
  priceAdjustmentType: 'markup' | 'discount'; // 마크업 또는 할인
  priceAdjustmentValue: number; // 조정 값 (%)
  autoSync: boolean; // 자동 동기화 여부
}

// 애플리케이션 상태
export interface AppState {
  rooms: Room[];
  roomGroups: RoomGroup[];
  seasons: Season[];
  manualPrices: ManualPrice[];
  currentMonth: string; // YYYY-MM
  selectedRoomIds: string[]; // 필터링된 객실
  lastMinuteDiscounts: LastMinuteDiscount[];
  onlinePartnerConfigs: OnlinePartnerConfig[];
  consecutiveNightDiscounts: ConsecutiveNightDiscount[];
}
