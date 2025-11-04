import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Calendar, Percent, Plus, Minus, DollarSign } from 'lucide-react';
import { Button } from '../common/Button';
import { usePricing } from '../../contexts/PricingContext';
import type { Channel, PriceChangeType } from '../../types';

interface QuickChangeDropdownProps {
  onComplete?: () => void;
}

export function QuickChangeDropdown({ onComplete }: QuickChangeDropdownProps) {
  const { state, dispatch } = usePricing();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 폼 상태
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [changeType, setChangeType] = useState<PriceChangeType>('percentage_increase');
  const [value, setValue] = useState('');
  const [selectedChannels, setSelectedChannels] = useState<Channel[]>(['reservation', 'online']);

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleChannelToggle = (channel: Channel) => {
    if (selectedChannels.includes(channel)) {
      if (selectedChannels.length > 1) {
        setSelectedChannels(selectedChannels.filter(c => c !== channel));
      }
    } else {
      setSelectedChannels([...selectedChannels, channel]);
    }
  };

  const handleApply = () => {
    if (!startDate || !endDate) {
      alert('날짜 범위를 선택해주세요.');
      return;
    }

    if (!value || isNaN(parseFloat(value))) {
      alert('유효한 값을 입력해주세요.');
      return;
    }

    if (startDate > endDate) {
      alert('종료일은 시작일보다 늦어야 합니다.');
      return;
    }

    const numValue = parseFloat(value);

    // 날짜 범위 생성
    const start = new Date(startDate);
    const end = new Date(endDate);
    const dates: string[] = [];

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      dates.push(dateStr);
    }

    // 각 날짜, 각 객실, 각 채널에 대해 수동 가격 설정
    dates.forEach((date) => {
      state.rooms.forEach((room) => {
        selectedChannels.forEach((channel) => {
          if (!room.channels.includes(channel)) return;

          // 현재 가격 가져오기
          const dayOfWeek = new Date(date).getDay();
          let dayType: 'weekday' | 'friday' | 'saturday' | 'sunday';
          if (dayOfWeek === 5) dayType = 'friday';
          else if (dayOfWeek === 6) dayType = 'saturday';
          else if (dayOfWeek === 0) dayType = 'sunday';
          else dayType = 'weekday';

          // 현재 시즌 찾기
          const season = state.seasons.find((s) => {
            if (s.isDefault) return false;
            return date >= s.startDate && date <= s.endDate;
          }) || state.seasons.find((s) => s.isDefault);

          if (!season) return;

          const roomPrice = season.roomPrices.find(
            (rp) => rp.roomId === room.id && rp.channel === channel
          );

          if (!roomPrice) return;

          const currentPrice = roomPrice.dayPrices[dayType];
          let newPrice = currentPrice;

          // 변경 타입에 따라 가격 계산
          switch (changeType) {
            case 'percentage_increase':
              newPrice = Math.round(currentPrice * (1 + numValue / 100));
              break;
            case 'percentage_decrease':
              newPrice = Math.round(currentPrice * (1 - numValue / 100));
              break;
            case 'amount_increase':
              newPrice = currentPrice + numValue;
              break;
            case 'amount_decrease':
              newPrice = currentPrice - numValue;
              break;
            case 'fixed':
              newPrice = numValue;
              break;
          }

          // 수동 가격 추가
          dispatch({
            type: 'ADD_MANUAL_PRICE',
            payload: {
              id: `manual-${Date.now()}-${Math.random()}`,
              date,
              roomId: room.id,
              channel,
              price: Math.max(0, Math.round(newPrice)),
              extraPersonPrices: roomPrice.extraPersonPrices[dayType],
              reason: '빠른 변경 (드롭다운)',
              createdAt: new Date().toISOString(),
            },
          });
        });
      });
    });

    alert(`${dates.length}일, ${state.rooms.length}개 객실, ${selectedChannels.length}개 채널에 가격이 적용되었습니다.`);
    setIsOpen(false);

    // 폼 초기화
    setStartDate('');
    setEndDate('');
    setValue('');

    if (onComplete) {
      onComplete();
    }
  };

  const changeTypeOptions = [
    { value: 'percentage_increase', label: '% 증가', icon: Plus },
    { value: 'percentage_decrease', label: '% 감소', icon: Minus },
    { value: 'amount_increase', label: '금액 증가', icon: Plus },
    { value: 'amount_decrease', label: '금액 감소', icon: Minus },
    { value: 'fixed', label: '고정 금액', icon: DollarSign },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2"
      >
        <Calendar className="w-4 h-4" />
        <span className="hidden sm:inline">드롭다운 변경</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <h3 className="font-semibold text-gray-900">빠른 가격 변경</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {/* 날짜 범위 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                날짜 범위
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* 변경 타입 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                변경 방식
              </label>
              <div className="grid grid-cols-2 gap-2">
                {changeTypeOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.value}
                      onClick={() => setChangeType(option.value as PriceChangeType)}
                      className={`flex items-center justify-center gap-2 px-3 py-2 text-sm rounded-lg border-2 transition-all ${
                        changeType === option.value
                          ? 'border-primary-500 bg-primary-50 text-primary-700 font-medium'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 값 입력 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {changeType.includes('percentage') ? '퍼센트 (%)' : '금액 (원)'}
              </label>
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={changeType === 'fixed' ? '100000' : '20'}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* 채널 선택 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                적용 채널
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => handleChannelToggle('reservation')}
                  className={`flex-1 px-3 py-2 text-sm rounded-lg border-2 transition-all ${
                    selectedChannels.includes('reservation')
                      ? 'border-primary-500 bg-primary-50 text-primary-700 font-medium'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  🏠 예약창
                </button>
                <button
                  onClick={() => handleChannelToggle('online')}
                  className={`flex-1 px-3 py-2 text-sm rounded-lg border-2 transition-all ${
                    selectedChannels.includes('online')
                      ? 'border-primary-500 bg-primary-50 text-primary-700 font-medium'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  🌐 온라인
                </button>
              </div>
            </div>

            {/* 미리보기 */}
            {startDate && endDate && value && (
              <div className="bg-info-50 border border-info-200 rounded-lg p-3">
                <div className="text-xs text-info-900 font-medium mb-1">
                  📊 적용 대상
                </div>
                <div className="text-xs text-info-700">
                  • 날짜: {startDate} ~ {endDate} (
                  {Math.floor((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1}일)
                  <br />
                  • 객실: {state.rooms.length}개 전체
                  <br />
                  • 채널: {selectedChannels.map(c => c === 'reservation' ? '예약창' : '온라인').join(', ')}
                </div>
              </div>
            )}

            {/* 액션 버튼 */}
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="flex-1"
              >
                취소
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleApply}
                className="flex-1"
                disabled={!startDate || !endDate || !value}
              >
                적용
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
