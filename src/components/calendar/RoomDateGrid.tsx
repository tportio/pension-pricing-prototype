import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Globe } from 'lucide-react';
import { usePricing } from '../../contexts/PricingContext';
import { getNextMonth, getPrevMonth, formatPrice } from '../../utils';
import { cn } from '../../utils';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import type { Channel } from '../../types';

interface RoomDateGridProps {
  selectedChannels: Channel[];
  selectedRoomIds: string[];
  onDateClick?: (date: Date) => void;
  onMultiDateSelect?: (dates: Date[]) => void;
}

export function RoomDateGrid({ selectedChannels, selectedRoomIds, onDateClick, onMultiDateSelect }: RoomDateGridProps) {
  const { state, dispatch, getDailyPriceInfo } = usePricing();
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);

  const [year, month] = state.currentMonth.split('-').map(Number);

  // 해당 월의 날짜들 생성 (1일~말일)
  const daysInMonth = new Date(year, month, 0).getDate();
  const dates: Date[] = [];
  for (let day = 1; day <= daysInMonth; day++) {
    dates.push(new Date(year, month - 1, day));
  }

  // 표시할 날짜들 (샘플: 1~10일만)
  const displayDates = dates.slice(0, Math.min(10, daysInMonth));

  const handlePrevMonth = () => {
    dispatch({ type: 'SET_CURRENT_MONTH', payload: getPrevMonth(state.currentMonth) });
    setSelectedDates([]);
  };

  const handleNextMonth = () => {
    dispatch({ type: 'SET_CURRENT_MONTH', payload: getNextMonth(state.currentMonth) });
    setSelectedDates([]);
  };

  // 표시할 객실 (필터 적용)
  const displayRooms = selectedRoomIds.length > 0
    ? state.rooms.filter(r => selectedRoomIds.includes(r.id))
    : state.rooms;

  // 날짜 선택 토글
  const toggleDateSelection = (date: Date) => {
    const dateStr = date.toISOString();
    const isSelected = selectedDates.some(d => d.toISOString() === dateStr);

    if (isSelected) {
      const newDates = selectedDates.filter(d => d.toISOString() !== dateStr);
      setSelectedDates(newDates);
      onMultiDateSelect?.(newDates);
    } else {
      const newDates = [...selectedDates, date];
      setSelectedDates(newDates);
      onMultiDateSelect?.(newDates);
    }
  };

  // 모든 날짜 선택/해제
  const toggleAllDates = () => {
    if (selectedDates.length === displayDates.length) {
      setSelectedDates([]);
      onMultiDateSelect?.([]);
    } else {
      setSelectedDates([...displayDates]);
      onMultiDateSelect?.(displayDates);
    }
  };

  // 날짜가 선택되었는지 확인
  const isDateSelected = (date: Date): boolean => {
    return selectedDates.some(d => d.toISOString() === date.toISOString());
  };

  // 셀 클릭 핸들러
  const handleCellClick = (date: Date) => {
    onDateClick?.(date);
  };

  // 가격 타입 뱃지 가져오기
  const getPriceTypeBadge = (appliedRule: 'manual' | 'season' | 'default') => {
    if (appliedRule === 'manual') {
      return <Badge variant="warning" className="text-[9px] px-1 py-0">수</Badge>;
    } else if (appliedRule === 'season') {
      return <Badge variant="info" className="text-[9px] px-1 py-0">시</Badge>;
    } else {
      return <Badge variant="default" className="text-[9px] px-1 py-0">기</Badge>;
    }
  };

  // 요일 표시
  const getDayOfWeek = (date: Date): string => {
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    return days[date.getDay()];
  };

  // 요일 색상
  const getDayColor = (date: Date): string => {
    const day = date.getDay();
    if (day === 0) return 'text-danger-600';
    if (day === 6) return 'text-primary-600';
    return 'text-gray-700';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
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

      {/* Grid */}
      <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: '600px' }}>
        <div
          className="grid gap-1 p-4"
          style={{
            gridTemplateColumns: `100px repeat(${displayDates.length}, minmax(120px, 1fr))`,
          }}
        >
          {/* Header Row - 객실 + 전체 선택 */}
          <div className="bg-gray-100 p-3 rounded font-semibold text-sm text-gray-700 flex flex-col items-center justify-center sticky top-0 z-20 gap-1">
            <div>객실</div>
            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedDates.length === displayDates.length && displayDates.length > 0}
                onChange={toggleAllDates}
                className="w-3.5 h-3.5"
              />
              <span className="text-[10px]">전체</span>
            </label>
          </div>

          {/* Header Row - 날짜들 with 체크박스 */}
          {displayDates.map((date, idx) => {
            const dayOfWeek = getDayOfWeek(date);
            const dayColor = getDayColor(date);
            const selected = isDateSelected(date);

            return (
              <div
                key={idx}
                className={cn(
                  "bg-gray-100 p-3 rounded text-center sticky top-0 z-20 transition-colors",
                  selected && "bg-primary-100 border-2 border-primary-400"
                )}
              >
                <label className="flex items-center justify-center gap-1 mb-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => toggleDateSelection(date)}
                    className="w-3.5 h-3.5"
                  />
                </label>
                <div className="text-sm font-semibold text-gray-900">
                  {date.getDate()}일
                </div>
                <div className={cn('text-xs font-medium', dayColor)}>
                  ({dayOfWeek})
                </div>
              </div>
            );
          })}

          {/* Data Rows - 각 객실 */}
          {displayRooms.map((room) => (
            <>
              {/* 객실명 */}
              <div
                key={`${room.id}-label`}
                className="bg-gray-50 p-3 rounded font-semibold text-sm text-gray-900 flex items-center justify-center sticky left-0 z-10"
              >
                {room.name}
              </div>

              {/* 날짜별 가격 셀 */}
              {displayDates.map((date, dateIdx) => {
                const priceInfo = getDailyPriceInfo(date);

                // 해당 객실의 가격 정보 필터링
                const roomPrices = priceInfo?.roomPrices.filter(
                  rp => rp.roomId === room.id && selectedChannels.includes(rp.channel)
                ) || [];

                // 매진 여부 확인
                const isSoldOut = priceInfo?.isSoldOut || false;

                // 가격 타입 확인
                const appliedRule = roomPrices[0]?.appliedRule;

                return (
                  <div
                    key={`${room.id}-${dateIdx}`}
                    onClick={() => handleCellClick(date)}
                    className={cn(
                      'border border-gray-200 rounded p-2 text-xs transition-all cursor-pointer hover:shadow-md hover:border-primary-400',
                      isSoldOut && 'bg-gray-100 opacity-60',
                      appliedRule === 'manual' && !isSoldOut && 'bg-yellow-50',
                      appliedRule === 'season' && !isSoldOut && 'bg-blue-50',
                      !isSoldOut && !appliedRule && 'hover:bg-gray-50'
                    )}
                  >
                    {isSoldOut ? (
                      <div className="text-center">
                        <div className="inline-block bg-danger-600 text-white px-2 py-1 rounded text-xs font-bold">
                          매진
                        </div>
                      </div>
                    ) : roomPrices.length > 0 ? (
                      <div className="space-y-1">
                        {roomPrices.map((rp, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between gap-1"
                          >
                            <div className="flex items-center gap-1">
                              {rp.channel === 'reservation' ? (
                                <Calendar className="w-3 h-3 text-primary-600 flex-shrink-0" />
                              ) : (
                                <Globe className="w-3 h-3 text-success-600 flex-shrink-0" />
                              )}
                              <span className="font-semibold text-gray-900">
                                {formatPrice(rp.price)}
                              </span>
                            </div>
                            {getPriceTypeBadge(rp.appliedRule)}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-gray-400">-</div>
                    )}
                  </div>
                );
              })}
            </>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="border-t border-gray-200 p-4 bg-gray-50">
        <div className="grid grid-cols-2 gap-4 text-xs">
          {/* 채널 타입 */}
          <div>
            <div className="font-semibold text-gray-700 mb-2">채널</div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary-600" />
                <span className="text-gray-700">예약창 요금</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-success-600" />
                <span className="text-gray-700">온라인채널 요금</span>
              </div>
            </div>
          </div>

          {/* 가격 타입 */}
          <div>
            <div className="font-semibold text-gray-700 mb-2">요금 타입</div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Badge variant="warning" className="text-[10px] px-1.5 py-0.5">수</Badge>
                <span className="text-gray-700">수동 설정 요금</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="info" className="text-[10px] px-1.5 py-0.5">시</Badge>
                <span className="text-gray-700">시즌 요금</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="default" className="text-[10px] px-1.5 py-0.5">기</Badge>
                <span className="text-gray-700">기본 요금</span>
              </div>
            </div>
          </div>
        </div>

        {/* 선택된 날짜 표시 */}
        {selectedDates.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-300">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-700">
                선택된 날짜: {selectedDates.length}개
              </span>
              <Button
                size="sm"
                variant="primary"
                onClick={() => onDateClick?.(selectedDates[0])}
              >
                선택 날짜 일괄 수정
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
