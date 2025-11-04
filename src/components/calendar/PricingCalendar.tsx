import { ChevronLeft, ChevronRight } from 'lucide-react';
import { usePricing } from '../../contexts/PricingContext';
import { getCalendarDays, getNextMonth, getPrevMonth } from '../../utils';
import { cn } from '../../utils';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import type { Channel } from '../../types';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

// 가격을 원 단위로 포맷 (예: 150000 -> "15만원", 150500 -> "15만원")
const formatPriceWon = (price: number): string => {
  if (price >= 10000) {
    const man = Math.floor(price / 10000);
    return `${man}만원`;
  }
  return `${price.toLocaleString()}원`;
};

// 시즌별 배경색 (고유 색상)
const getSeasonBackgroundColor = (seasonId?: string, isDefault?: boolean): string => {
  if (!seasonId || isDefault) return '#ffffff'; // 기본 요금은 흰색

  // 시즌 ID 해시를 기반으로 색상 선택
  const hash = seasonId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const colors = [
    '#dbeafe', // 파란색
    '#dcfce7', // 초록색
    '#fef3c7', // 노란색
    '#fed7aa', // 주황색
    '#fce7f3', // 분홍색
    '#e9d5ff', // 보라색
    '#bfdbfe', // 인디고
  ];
  return colors[hash % colors.length];
};

interface PricingCalendarProps {
  onDateClick?: (date: Date) => void;
  selectedChannels?: Channel[];
  selectedRoomIds?: string[];
}

export function PricingCalendar({
  onDateClick,
  selectedChannels = ['reservation', 'online'],
  selectedRoomIds = []
}: PricingCalendarProps) {
  const { state, dispatch, getDailyPriceInfo } = usePricing();

  const [year, month] = state.currentMonth.split('-').map(Number);
  const calendarDays = getCalendarDays(year, month);

  const handlePrevMonth = () => {
    dispatch({ type: 'SET_CURRENT_MONTH', payload: getPrevMonth(state.currentMonth) });
  };

  const handleNextMonth = () => {
    dispatch({ type: 'SET_CURRENT_MONTH', payload: getNextMonth(state.currentMonth) });
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() + 1 === month;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white">
        <Button
          size="sm"
          variant="ghost"
          onClick={handlePrevMonth}
          className="text-white hover:bg-primary-500"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <h2 className="text-lg font-semibold">
          {year}년 {month}월
        </h2>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleNextMonth}
          className="text-white hover:bg-primary-500"
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
        {WEEKDAYS.map((day, index) => (
          <div
            key={day}
            className={cn(
              'p-3 text-center font-semibold text-sm',
              index === 0 ? 'text-danger-600' : index === 6 ? 'text-primary-600' : 'text-gray-700'
            )}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7">
        {calendarDays.map((date, index) => {
          const currentMonth = isCurrentMonth(date);
          const priceInfo = currentMonth ? getDailyPriceInfo(date) : null;

          // 필터 적용: 선택된 채널과 객실만 표시
          let filteredPriceInfo = priceInfo;
          if (priceInfo && selectedRoomIds.length > 0) {
            const filteredRoomPrices = priceInfo.roomPrices.filter(
              rp => selectedChannels.includes(rp.channel) && selectedRoomIds.includes(rp.roomId)
            );

            if (filteredRoomPrices.length > 0) {
              const prices = filteredRoomPrices.map(rp => rp.price);
              filteredPriceInfo = {
                ...priceInfo,
                roomPrices: filteredRoomPrices,
                minPrice: Math.min(...prices),
                maxPrice: Math.max(...prices),
                avgPrice: Math.round(prices.reduce((sum, p) => sum + p, 0) / prices.length),
              };
            } else {
              filteredPriceInfo = null;
            }
          }

          // 수동 설정 여부 확인 (하나라도 수동이면 true)
          const hasManualPrice = filteredPriceInfo?.roomPrices.some(rp => rp.appliedRule === 'manual') || false;

          // 시즌별 배경색 계산 (수동이 아닌 경우만)
          const backgroundColor = currentMonth && filteredPriceInfo && !hasManualPrice
            ? getSeasonBackgroundColor(
                filteredPriceInfo.seasonId,
                filteredPriceInfo.appliedRule === 'default'
              )
            : currentMonth && hasManualPrice
            ? '#fef3c7' // 수동 설정은 노란색
            : undefined;

          return (
            <div
              key={index}
              onClick={() => currentMonth && onDateClick?.(date)}
              className={cn(
                'min-h-[110px] border-r border-b border-gray-100 p-2',
                !currentMonth && 'bg-gray-50 opacity-50',
                currentMonth && 'cursor-pointer transition-colors hover:brightness-95'
              )}
              style={backgroundColor ? { backgroundColor } : undefined}
            >
              {currentMonth && filteredPriceInfo && (
                <>
                  {/* Date Number */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1">
                      <span
                        className={cn(
                          'text-sm font-semibold',
                          date.getDay() === 0
                            ? 'text-danger-600'
                            : date.getDay() === 6
                            ? 'text-primary-600'
                            : 'text-gray-900'
                        )}
                      >
                        {date.getDate()}
                      </span>
                      {hasManualPrice && (
                        <span className="text-xs font-bold text-warning-700 bg-warning-200 px-1 rounded">
                          수
                        </span>
                      )}
                    </div>
                    {filteredPriceInfo.isHoliday && (
                      <span className="text-xs font-bold text-danger-700 bg-danger-200 px-1 rounded">
                        휴
                      </span>
                    )}
                  </div>

                  {/* Price Info - 원 단위로 표시 */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500">최저</span>
                      <span className="font-semibold text-success-600">
                        {formatPriceWon(filteredPriceInfo.minPrice)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500">최고</span>
                      <span className="font-semibold text-danger-600">
                        {formatPriceWon(filteredPriceInfo.maxPrice)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500">평균</span>
                      <span className="font-semibold text-gray-700">
                        {formatPriceWon(filteredPriceInfo.avgPrice)}
                      </span>
                    </div>
                  </div>

                  {/* Sold Out Badge */}
                  {filteredPriceInfo.isSoldOut && (
                    <div className="mt-2">
                      <Badge variant="danger" className="text-xs w-full text-center">
                        매진
                      </Badge>
                    </div>
                  )}
                </>
              )}

              {!currentMonth && (
                <span className="text-sm text-gray-400">{date.getDate()}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
