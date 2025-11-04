import { createContext, useContext, useReducer } from 'react';
import type { ReactNode } from 'react';
import type {
  Room,
  Season,
  ManualPrice,
  AppState,
  Channel,
  DailyPriceInfo,
} from '../types';
import { mockRooms, mockRoomGroups, mockSeasons, mockManualPrices } from '../services/mockData';
import { getCurrentMonth, getDayType, isWeekend, isHoliday, formatDateString } from '../utils';
import { isDateInSeason, calculatePriceFromPercentage } from '../utils/seasonUtils';

// 액션 타입
type Action =
  | { type: 'SET_CURRENT_MONTH'; payload: string }
  | { type: 'SET_SELECTED_ROOMS'; payload: string[] }
  | { type: 'ADD_SEASON'; payload: Season }
  | { type: 'UPDATE_SEASON'; payload: Season }
  | { type: 'DELETE_SEASON'; payload: string }
  | { type: 'ADD_MANUAL_PRICE'; payload: ManualPrice }
  | { type: 'DELETE_MANUAL_PRICE'; payload: string }
  | { type: 'CLEAR_ALL_MANUAL_PRICES' }
  | { type: 'BULK_UPDATE_PRICES'; payload: { seasonId: string; roomPrices: any[] } };

// 초기 상태
const initialState: AppState = {
  rooms: mockRooms,
  roomGroups: mockRoomGroups,
  seasons: mockSeasons,
  manualPrices: mockManualPrices,
  currentMonth: getCurrentMonth(),
  selectedRoomIds: [], // 빈 배열 = 전체 선택
  lastMinuteDiscounts: [],
  onlinePartnerConfigs: [],
};

// Reducer
function pricingReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_CURRENT_MONTH':
      return { ...state, currentMonth: action.payload };

    case 'SET_SELECTED_ROOMS':
      return { ...state, selectedRoomIds: action.payload };

    case 'ADD_SEASON':
      return { ...state, seasons: [...state.seasons, action.payload] };

    case 'UPDATE_SEASON':
      return {
        ...state,
        seasons: state.seasons.map((s) => (s.id === action.payload.id ? action.payload : s)),
      };

    case 'DELETE_SEASON':
      return {
        ...state,
        seasons: state.seasons.filter((s) => s.id !== action.payload),
      };

    case 'ADD_MANUAL_PRICE':
      return { ...state, manualPrices: [...state.manualPrices, action.payload] };

    case 'DELETE_MANUAL_PRICE':
      return {
        ...state,
        manualPrices: state.manualPrices.filter((p) => p.id !== action.payload),
      };

    case 'CLEAR_ALL_MANUAL_PRICES':
      return {
        ...state,
        manualPrices: [],
      };

    case 'BULK_UPDATE_PRICES':
      return {
        ...state,
        seasons: state.seasons.map((s) =>
          s.id === action.payload.seasonId
            ? { ...s, roomPrices: action.payload.roomPrices }
            : s
        ),
      };

    default:
      return state;
  }
}

// Context 타입
interface PricingContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  getFilteredRooms: () => Room[];
  getRoomById: (id: string) => Room | undefined;
  getSeasonForDate: (date: Date) => Season | undefined;
  getPriceForDate: (date: Date, roomId: string, channel: Channel) => number;
  getDailyPriceInfo: (date: Date) => DailyPriceInfo;
}

const PricingContext = createContext<PricingContextType | undefined>(undefined);

// Provider Props
interface PricingProviderProps {
  children: ReactNode;
}

// Provider
export function PricingProvider({ children }: PricingProviderProps) {
  const [state, dispatch] = useReducer(pricingReducer, initialState);

  // 필터링된 객실 가져오기
  const getFilteredRooms = (): Room[] => {
    if (state.selectedRoomIds.length === 0) {
      return state.rooms;
    }
    return state.rooms.filter((room) => state.selectedRoomIds.includes(room.id));
  };

  // ID로 객실 찾기
  const getRoomById = (id: string): Room | undefined => {
    return state.rooms.find((room) => room.id === id);
  };

  // 날짜에 해당하는 시즌 찾기 (다중 기간 및 반복 패턴 지원)
  const getSeasonForDate = (date: Date): Season | undefined => {
    // 기본 요금을 제외한 시즌들 중 해당 날짜가 포함된 시즌 찾기
    const applicableSeason = state.seasons.find((season) => {
      if (season.isDefault) return false;
      return isDateInSeason(date, season);
    });

    // 해당하는 시즌이 있으면 반환, 없으면 기본 요금 반환
    return applicableSeason || state.seasons.find((s) => s.isDefault);
  };

  // 특정 날짜의 객실 요금 가져오기 (퍼센트 기반 지원)
  const getPriceForDate = (date: Date, roomId: string, channel: Channel): number => {
    const dateStr = formatDateString(date);

    // 1. 수동 설정 요금 확인
    const manualPrice = state.manualPrices.find(
      (p) => p.date === dateStr && p.roomId === roomId && p.channel === channel
    );
    if (manualPrice) {
      return manualPrice.price;
    }

    // 2. 시즌 요금 확인
    const season = getSeasonForDate(date);
    if (!season) return 0;

    const roomPrice = season.roomPrices.find(
      (rp) => rp.roomId === roomId && rp.channel === channel
    );
    if (!roomPrice) return 0;

    // 3. 요일에 따른 요금 반환
    const dayType = getDayType(date);
    let price = roomPrice.dayPrices[dayType];

    // 4. 퍼센트 기반 설정이 있으면 기본 요금 대비 계산
    if (roomPrice.pricingConfig && roomPrice.pricingConfig[dayType]) {
      const config = roomPrice.pricingConfig[dayType];
      if (config && config.method === 'percentage') {
        // 기본 요금 가져오기
        const defaultSeason = state.seasons.find(s => s.isDefault);
        if (defaultSeason) {
          const defaultRoomPrice = defaultSeason.roomPrices.find(
            (rp) => rp.roomId === roomId && rp.channel === channel
          );
          if (defaultRoomPrice) {
            const basePrice = defaultRoomPrice.dayPrices[dayType];
            price = calculatePriceFromPercentage(basePrice, config.value);
          }
        }
      }
    }

    return price;
  };

  // 일자별 요금 정보 가져오기
  const getDailyPriceInfo = (date: Date): DailyPriceInfo => {
    const dateStr = formatDateString(date);
    const dayType = getDayType(date);
    const season = getSeasonForDate(date);

    const filteredRooms = getFilteredRooms();
    const roomPrices = filteredRooms.flatMap((room) =>
      room.channels.map((channel) => {
        // 각 객실/채널별로 적용된 규칙 확인
        const manualPrice = state.manualPrices.find(
          (p) => p.date === dateStr && p.roomId === room.id && p.channel === channel
        );

        let appliedRule: 'manual' | 'season' | 'default' = 'default';
        let appliedSeasonName: string | undefined;

        if (manualPrice) {
          appliedRule = 'manual';
        } else if (season && !season.isDefault) {
          appliedRule = 'season';
          appliedSeasonName = season.name;
        } else {
          appliedRule = 'default';
        }

        const price = getPriceForDate(date, room.id, channel);
        const roomPriceInfo = season?.roomPrices.find(
          (rp) => rp.roomId === room.id && rp.channel === channel
        );

        return {
          roomId: room.id,
          roomName: room.name,
          channel,
          price,
          extraPersonPrices: roomPriceInfo?.extraPersonPrices[dayType] || {
            adult: 0,
            child: 0,
            infant: 0,
          },
          appliedRule,
          seasonName: appliedSeasonName,
        };
      })
    );

    const prices = roomPrices.map((rp) => rp.price).filter((p) => p > 0);
    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
    const avgPrice =
      prices.length > 0 ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : 0;

    // 수동 설정 여부 확인
    const hasManualPrice = state.manualPrices.some((p) => p.date === dateStr);

    return {
      date: dateStr,
      dayOfWeek: dayType,
      isWeekend: isWeekend(date),
      isHoliday: isHoliday(date),
      isSoldOut: false, // TODO: 예약 데이터와 연동 필요
      appliedRule: hasManualPrice ? 'manual' : season?.isDefault ? 'default' : 'season',
      seasonId: season?.id,
      seasonName: season?.name,
      minPrice,
      maxPrice,
      avgPrice,
      roomPrices,
    };
  };

  const value: PricingContextType = {
    state,
    dispatch,
    getFilteredRooms,
    getRoomById,
    getSeasonForDate,
    getPriceForDate,
    getDailyPriceInfo,
  };

  return <PricingContext.Provider value={value}>{children}</PricingContext.Provider>;
}

// Hook
export function usePricing() {
  const context = useContext(PricingContext);
  if (context === undefined) {
    throw new Error('usePricing must be used within a PricingProvider');
  }
  return context;
}
