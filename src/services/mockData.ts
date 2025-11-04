import type {
  Room,
  RoomGroup,
  Season,
  SeasonRoomPrice,
  DayPrice,
  DayExtraPersonPrice,
  ExtraPersonPrice,
} from '../types';

// 기본 인원추가 요금
const DEFAULT_EXTRA_PERSON_PRICES: ExtraPersonPrice = {
  adult: 20000,
  child: 10000,
  infant: 0,
};

// 성수기 인원추가 요금 (20% 할증)
const PEAK_EXTRA_PERSON_PRICES: ExtraPersonPrice = {
  adult: 24000,
  child: 12000,
  infant: 0,
};

// 요일별 인원추가 요금 생성 헬퍼
function createDayExtraPersonPrice(extraPrice: ExtraPersonPrice): DayExtraPersonPrice {
  return {
    weekday: extraPrice,
    friday: extraPrice,
    saturday: extraPrice,
    sunday: extraPrice,
  };
}

// 객실 그룹 (동일 타입 10개)
export const mockRoomGroup: RoomGroup = {
  id: 'group-standard',
  name: '스탠다드 객실',
  description: '동일한 타입의 스탠다드 객실 10개',
  roomIds: Array.from({ length: 10 }, (_, i) => `room-standard-${i + 1}`),
};

// 스탠다드 객실 10개 (예약창만)
export const mockStandardRooms: Room[] = Array.from({ length: 10 }, (_, i) => ({
  id: `room-standard-${i + 1}`,
  name: `${100 + i + 1}호 스탠다드`,
  groupId: 'group-standard',
  standardCapacity: 4,
  maxCapacity: 6,
  channels: ['reservation'],
  description: '스탠다드 타입 객실',
}));

// 독채 타입 객실 10개 (예약창 + 온라인)
export const mockVillaRooms: Room[] = [
  {
    id: 'room-villa-1',
    name: '201호 독채A',
    standardCapacity: 6,
    maxCapacity: 10,
    channels: ['reservation', 'online'],
    description: '독채 타입 객실 (가장 저렴)',
  },
  {
    id: 'room-villa-2',
    name: '202호 독채B',
    standardCapacity: 6,
    maxCapacity: 10,
    channels: ['reservation', 'online'],
    description: '독채 타입 객실',
  },
  {
    id: 'room-villa-3',
    name: '203호 독채C',
    standardCapacity: 8,
    maxCapacity: 12,
    channels: ['reservation', 'online'],
    description: '독채 타입 객실',
  },
  {
    id: 'room-villa-4',
    name: '204호 독채D',
    standardCapacity: 8,
    maxCapacity: 12,
    channels: ['reservation', 'online'],
    description: '독채 타입 객실',
  },
  {
    id: 'room-villa-5',
    name: '205호 독채E',
    standardCapacity: 8,
    maxCapacity: 12,
    channels: ['reservation', 'online'],
    description: '독채 타입 객실',
  },
  {
    id: 'room-villa-6',
    name: '206호 독채F',
    standardCapacity: 10,
    maxCapacity: 15,
    channels: ['reservation', 'online'],
    description: '독채 타입 객실',
  },
  {
    id: 'room-villa-7',
    name: '207호 독채G',
    standardCapacity: 10,
    maxCapacity: 15,
    channels: ['reservation', 'online'],
    description: '독채 타입 객실',
  },
  {
    id: 'room-villa-8',
    name: '208호 독채H',
    standardCapacity: 10,
    maxCapacity: 15,
    channels: ['reservation', 'online'],
    description: '독채 타입 객실',
  },
  {
    id: 'room-villa-9',
    name: '209호 독채I',
    standardCapacity: 12,
    maxCapacity: 18,
    channels: ['reservation', 'online'],
    description: '독채 타입 객실',
  },
  {
    id: 'room-villa-10',
    name: '210호 펜트하우스',
    standardCapacity: 12,
    maxCapacity: 20,
    channels: ['reservation', 'online'],
    description: '독채 타입 객실 (가장 비쌈)',
  },
];

export const mockRooms: Room[] = [...mockStandardRooms, ...mockVillaRooms];

// 스탠다드 객실 시즌별 요금 생성
function createStandardSeasonPrices(basePrices: DayPrice): SeasonRoomPrice[] {
  return mockStandardRooms.map((room) => ({
    roomId: room.id,
    channel: 'reservation' as const,
    dayPrices: basePrices,
    extraPersonPrices: createDayExtraPersonPrice(DEFAULT_EXTRA_PERSON_PRICES),
  }));
}

// 독채 객실 시즌별 요금 생성
function createVillaSeasonPrices(
  basePriceMultipliers: number[],
  extraPersonPrice: ExtraPersonPrice
): SeasonRoomPrice[] {
  const prices: SeasonRoomPrice[] = [];

  mockVillaRooms.forEach((room, index) => {
    const multiplier = basePriceMultipliers[index];
    const baseDayPrices: DayPrice = {
      weekday: 400000 * multiplier,
      friday: 480000 * multiplier,
      saturday: 1400000 * multiplier,
      sunday: 440000 * multiplier,
    };

    // 예약창 요금
    prices.push({
      roomId: room.id,
      channel: 'reservation',
      dayPrices: baseDayPrices,
      extraPersonPrices: createDayExtraPersonPrice(extraPersonPrice),
    });

    // 온라인 요금 (10% 저렴)
    prices.push({
      roomId: room.id,
      channel: 'online',
      dayPrices: {
        weekday: Math.round(baseDayPrices.weekday * 0.9),
        friday: Math.round(baseDayPrices.friday * 0.9),
        saturday: Math.round(baseDayPrices.saturday * 0.9),
        sunday: Math.round(baseDayPrices.sunday * 0.9),
      },
      extraPersonPrices: createDayExtraPersonPrice(extraPersonPrice),
    });
  });

  return prices;
}

// 비수기 (기본 요금)
const defaultSeasonStandardPrices: DayPrice = {
  weekday: 100000,
  friday: 120000,
  saturday: 350000,
  sunday: 110000,
};

const villaMultipliers = [1.0, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 2.0];

export const mockSeasons: Season[] = [
  {
    id: 'season-default',
    name: '기본 요금 (비수기)',
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    isDefault: true,
    description: '기본 요금',
    roomPrices: [
      ...createStandardSeasonPrices(defaultSeasonStandardPrices),
      ...createVillaSeasonPrices(villaMultipliers, DEFAULT_EXTRA_PERSON_PRICES),
    ],
  },
  {
    id: 'season-spring',
    name: '봄 시즌',
    startDate: '2025-04-01',
    endDate: '2025-05-31',
    dateRanges: [
      {
        id: 'range-spring-1',
        startDate: '2025-04-01',
        endDate: '2025-05-31',
      },
    ],
    recurrence: {
      type: 'yearly',
      startYear: 2025,
    },
    description: '비수기 대비 15% 할증',
    roomPrices: [
      ...createStandardSeasonPrices({
        weekday: Math.round(defaultSeasonStandardPrices.weekday * 1.15),
        friday: Math.round(defaultSeasonStandardPrices.friday * 1.15),
        saturday: Math.round(defaultSeasonStandardPrices.saturday * 1.15),
        sunday: Math.round(defaultSeasonStandardPrices.sunday * 1.15),
      }),
      ...createVillaSeasonPrices(
        villaMultipliers.map((m) => m * 1.15),
        DEFAULT_EXTRA_PERSON_PRICES
      ),
    ],
  },
  {
    id: 'season-summer',
    name: '여름 성수기',
    startDate: '2025-07-01',
    endDate: '2025-07-25',
    dateRanges: [
      {
        id: 'range-summer-1',
        startDate: '2025-07-01',
        endDate: '2025-07-25',
      },
    ],
    recurrence: {
      type: 'yearly',
      startYear: 2025,
    },
    description: '비수기 대비 30% 할증',
    roomPrices: [
      ...createStandardSeasonPrices({
        weekday: Math.round(defaultSeasonStandardPrices.weekday * 1.3),
        friday: Math.round(defaultSeasonStandardPrices.friday * 1.3),
        saturday: Math.round(defaultSeasonStandardPrices.saturday * 1.3),
        sunday: Math.round(defaultSeasonStandardPrices.sunday * 1.3),
      }),
      ...createVillaSeasonPrices(
        villaMultipliers.map((m) => m * 1.3),
        PEAK_EXTRA_PERSON_PRICES
      ),
    ],
  },
  {
    id: 'season-peak-summer',
    name: '여름 극성수기',
    startDate: '2025-07-26',
    endDate: '2025-08-25',
    dateRanges: [
      {
        id: 'range-peak-summer-1',
        startDate: '2025-07-26',
        endDate: '2025-08-25',
      },
    ],
    recurrence: {
      type: 'yearly',
      startYear: 2025,
    },
    description: '비수기 대비 50% 할증',
    roomPrices: [
      ...createStandardSeasonPrices({
        weekday: Math.round(defaultSeasonStandardPrices.weekday * 1.5),
        friday: Math.round(defaultSeasonStandardPrices.friday * 1.5),
        saturday: Math.round(defaultSeasonStandardPrices.saturday * 1.5),
        sunday: Math.round(defaultSeasonStandardPrices.sunday * 1.5),
      }),
      ...createVillaSeasonPrices(
        villaMultipliers.map((m) => m * 1.5),
        PEAK_EXTRA_PERSON_PRICES
      ),
    ],
  },
  {
    id: 'season-chuseok',
    name: '추석 연휴',
    startDate: '2025-10-04',
    endDate: '2025-10-08',
    dateRanges: [
      {
        id: 'range-chuseok-1',
        startDate: '2025-10-04',
        endDate: '2025-10-08',
      },
    ],
    description: '추석 연휴 특별 요금 (40% 할증)',
    notifyBeforeDays: 30,
    roomPrices: [
      ...createStandardSeasonPrices({
        weekday: Math.round(defaultSeasonStandardPrices.weekday * 1.4),
        friday: Math.round(defaultSeasonStandardPrices.friday * 1.4),
        saturday: Math.round(defaultSeasonStandardPrices.saturday * 1.4),
        sunday: Math.round(defaultSeasonStandardPrices.sunday * 1.4),
      }),
      ...createVillaSeasonPrices(
        villaMultipliers.map((m) => m * 1.4),
        PEAK_EXTRA_PERSON_PRICES
      ),
    ],
  },
  {
    id: 'season-autumn',
    name: '가을 단풍 시즌',
    startDate: '2025-10-15',
    endDate: '2025-10-31',
    dateRanges: [
      {
        id: 'range-autumn-1',
        startDate: '2025-10-15',
        endDate: '2025-10-31',
      },
    ],
    recurrence: {
      type: 'yearly',
      startYear: 2025,
    },
    description: '가을 단풍 시즌 (20% 할증)',
    notifyBeforeDays: 30,
    roomPrices: [
      ...createStandardSeasonPrices({
        weekday: Math.round(defaultSeasonStandardPrices.weekday * 1.2),
        friday: Math.round(defaultSeasonStandardPrices.friday * 1.2),
        saturday: Math.round(defaultSeasonStandardPrices.saturday * 1.2),
        sunday: Math.round(defaultSeasonStandardPrices.sunday * 1.2),
      }),
      ...createVillaSeasonPrices(
        villaMultipliers.map((m) => m * 1.2),
        DEFAULT_EXTRA_PERSON_PRICES
      ),
    ],
  },
  {
    id: 'season-winter',
    name: '겨울 시즌',
    startDate: '2025-12-20',
    endDate: '2025-12-31',
    dateRanges: [
      {
        id: 'range-winter-1',
        startDate: '2025-12-20',
        endDate: '2025-12-31',
      },
    ],
    recurrence: {
      type: 'yearly',
      startYear: 2025,
    },
    description: '연말 연휴 시즌 (35% 할증)',
    notifyBeforeDays: 45,
    roomPrices: [
      ...createStandardSeasonPrices({
        weekday: Math.round(defaultSeasonStandardPrices.weekday * 1.35),
        friday: Math.round(defaultSeasonStandardPrices.friday * 1.35),
        saturday: Math.round(defaultSeasonStandardPrices.saturday * 1.35),
        sunday: Math.round(defaultSeasonStandardPrices.sunday * 1.35),
      }),
      ...createVillaSeasonPrices(
        villaMultipliers.map((m) => m * 1.35),
        PEAK_EXTRA_PERSON_PRICES
      ),
    ],
  },
];

export const mockRoomGroups: RoomGroup[] = [mockRoomGroup];

// 수동 설정 샘플 데이터 (2025년 10월 일부 날짜)
export const mockManualPrices = [
  // 10월 1일 - 독채 1호 예약창만 수동 설정
  {
    id: 'manual-1',
    date: '2025-10-01',
    roomId: 'room-villa-1',
    channel: 'reservation' as const,
    price: 500000,
    extraPersonPrices: {
      adult: 25000,
      child: 12000,
      infant: 0,
    },
    reason: '특별 할인 이벤트',
    createdAt: '2025-09-25T10:00:00Z',
  },
  // 10월 12일 - 스탠다드 1호 예약창 수동 설정
  {
    id: 'manual-2',
    date: '2025-10-12',
    roomId: 'room-standard-1',
    channel: 'reservation' as const,
    price: 150000,
    extraPersonPrices: {
      adult: 25000,
      child: 13000,
      infant: 0,
    },
    reason: '주말 특가',
    createdAt: '2025-10-05T14:30:00Z',
  },
  // 10월 6일 - 추석 당일이면서 수동 설정 (독채 3호 예약창)
  {
    id: 'manual-3',
    date: '2025-10-06',
    roomId: 'room-villa-3',
    channel: 'reservation' as const,
    price: 800000,
    extraPersonPrices: {
      adult: 30000,
      child: 15000,
      infant: 0,
    },
    reason: '추석 당일 특별 프로모션',
    createdAt: '2025-09-28T10:00:00Z',
  },
  // 10월 20일 - 독채 5호 온라인만 수동 설정
  {
    id: 'manual-4',
    date: '2025-10-20',
    roomId: 'room-villa-5',
    channel: 'online' as const,
    price: 650000,
    extraPersonPrices: {
      adult: 22000,
      child: 11000,
      infant: 0,
    },
    reason: '온라인 전용 프로모션',
    createdAt: '2025-10-10T09:15:00Z',
  },
];
