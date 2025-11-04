import { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { formatKoreanDate, getDaysDifference } from '../../utils';
import { usePricing } from '../../contexts/PricingContext';
import type { QuickPreset } from '../../types';

interface PriceChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  preset: QuickPreset | null;
}

type ChangeMethodType = 'percent' | 'fixed_amount' | 'absolute';
type AdjustmentType = 'increase' | 'decrease';

export function PriceChangeModal({ isOpen, onClose, preset }: PriceChangeModalProps) {
  const { state } = usePricing();
  const [startDate, setStartDate] = useState(preset?.dateRange?.start || '');
  const [endDate, setEndDate] = useState(preset?.dateRange?.end || '');
  const [changeMethod, setChangeMethod] = useState<ChangeMethodType>('percent');
  const [adjustmentType, setAdjustmentType] = useState<AdjustmentType>('increase');
  const [percentValue, setPercentValue] = useState<number>(20);
  const [fixedAmountValue, setFixedAmountValue] = useState<number>(30000);
  const [selectedRoomIds, setSelectedRoomIds] = useState<string[]>([]);
  const [groupPrices, setGroupPrices] = useState<Record<string, number>>({});

  useEffect(() => {
    if (preset?.dateRange) {
      setStartDate(preset.dateRange.start);
      setEndDate(preset.dateRange.end);
    }
  }, [preset]);

  if (!preset) return null;

  const days = startDate && endDate ? getDaysDifference(startDate, endDate) : 0;

  const handleApply = () => {
    // TODO: 실제 요금 변경 로직 구현
    console.log('Apply price change:', {
      preset,
      startDate,
      endDate,
      changeMethod,
      adjustmentType,
      percentValue,
      fixedAmountValue,
      groupPrices,
      selectedRoomIds,
    });
    onClose();
  };

  const handleRoomToggle = (roomId: string) => {
    if (selectedRoomIds.includes(roomId)) {
      setSelectedRoomIds(selectedRoomIds.filter((id) => id !== roomId));
    } else {
      setSelectedRoomIds([...selectedRoomIds, roomId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedRoomIds.length === state.rooms.length) {
      setSelectedRoomIds([]);
    } else {
      setSelectedRoomIds(state.rooms.map((r) => r.id));
    }
  };

  const handleGroupPriceChange = (groupId: string, value: number) => {
    setGroupPrices({ ...groupPrices, [groupId]: value });
  };

  // 임시 데모 데이터 - 현재 요금 미리보기용
  const getDemoCurrentPrices = () => {
    // 날짜가 없으면 기본 데모 데이터 표시
    if (!startDate || !endDate) {
      const today = new Date();
      return [
        {
          date: '9/14(토)',
          prices: state.rooms.slice(0, 4).map(room => ({
            roomName: room.name,
            price: Math.floor(Math.random() * 100000) + 100000,
          }))
        },
        {
          date: '9/15(일)',
          prices: state.rooms.slice(0, 4).map(room => ({
            roomName: room.name,
            price: Math.floor(Math.random() * 80000) + 90000,
          }))
        },
        {
          date: '9/16(월)',
          prices: state.rooms.slice(0, 4).map(room => ({
            roomName: room.name,
            price: Math.floor(Math.random() * 50000) + 80000,
          }))
        },
      ];
    }

    const dates = [];
    const start = new Date(startDate);
    const end = new Date(endDate);

    for (let d = new Date(start); d <= end && dates.length < 3; d.setDate(d.getDate() + 1)) {
      dates.push(new Date(d));
    }

    return dates.map(date => ({
      date: formatKoreanDate(date),
      prices: state.rooms.slice(0, 4).map(room => ({
        roomName: room.name,
        price: Math.floor(Math.random() * 100000) + 100000,
      }))
    }));
  };

  // 예상 요금 계산
  const calculatePreviewPrice = (currentPrice: number): number => {
    if (changeMethod === 'percent') {
      const multiplier = adjustmentType === 'increase' ? (1 + percentValue / 100) : (1 - percentValue / 100);
      return Math.floor(currentPrice * multiplier);
    } else if (changeMethod === 'fixed_amount') {
      return adjustmentType === 'increase'
        ? currentPrice + fixedAmountValue
        : currentPrice - fixedAmountValue;
    }
    return currentPrice;
  };

  const currentPrices = getDemoCurrentPrices();
  const totalCombinations = days * selectedRoomIds.length;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`⚡ ${preset.name}`} size="xl">
      <div className="space-y-5">
        {/* 기간 정보 */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">📅 적용 기간</h3>
          {startDate && endDate ? (
            <div className="text-blue-700 text-base">
              {formatKoreanDate(new Date(startDate))} ~ {formatKoreanDate(new Date(endDate))} · {days}일
            </div>
          ) : (
            <div className="text-sm text-gray-500">날짜를 선택해주세요</div>
          )}
        </div>

        {/* 현재 요금 미리보기 */}
        {currentPrices.length > 0 && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-2.5">💰 현재 설정된 요금</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 px-3 font-semibold text-gray-700">날짜</th>
                      {currentPrices[0]?.prices.slice(0, 4).map((p, i) => (
                        <th key={i} className="text-right py-2 px-3 font-semibold text-gray-700">{p.roomName}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {currentPrices.map((dateInfo, idx) => (
                      <tr key={idx} className="border-b border-gray-100 last:border-0">
                        <td className="py-2 px-3 text-gray-600">{dateInfo.date}</td>
                        {dateInfo.prices.map((p, i) => (
                          <td key={i} className="text-right py-2 px-3 text-gray-900">
                            {p.price.toLocaleString()}원
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {days > 3 && (
                  <div className="text-center mt-3 text-xs text-gray-500">
                    + {days - 3}개 날짜 더보기...
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 변경 옵션 */}
        <div className="border-2 border-green-500 rounded-lg p-5">
          <h3 className="font-semibold text-gray-900 mb-4 text-base">🎯 요금 변경 방식</h3>

          <div className="space-y-3">
            {/* 정률 변경 */}
            <label
              className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => setChangeMethod('percent')}
            >
              <input
                type="radio"
                name="changeMethod"
                value="percent"
                checked={changeMethod === 'percent'}
                onChange={() => setChangeMethod('percent')}
                className="w-[18px] h-[18px]"
              />
              <div className="flex-1">
                <div className="font-semibold text-gray-900">정률 변경 (%)</div>
                <div className="text-xs text-gray-600">현재 요금 기준으로 비율 적용</div>
              </div>
              {changeMethod === 'percent' && (
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <select
                    value={adjustmentType}
                    onChange={(e) => setAdjustmentType(e.target.value as AdjustmentType)}
                    className="px-2.5 py-1.5 border border-gray-300 rounded text-sm"
                  >
                    <option value="increase">할증 (+)</option>
                    <option value="decrease">할인 (-)</option>
                  </select>
                  <input
                    type="number"
                    value={percentValue}
                    onChange={(e) => setPercentValue(Number(e.target.value))}
                    className="w-16 px-2.5 py-1.5 border border-gray-300 rounded text-right text-sm"
                  />
                  <span className="text-sm">%</span>
                </div>
              )}
            </label>

            {/* 정액 변경 */}
            <label
              className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => setChangeMethod('fixed_amount')}
            >
              <input
                type="radio"
                name="changeMethod"
                value="fixed_amount"
                checked={changeMethod === 'fixed_amount'}
                onChange={() => setChangeMethod('fixed_amount')}
                className="w-[18px] h-[18px]"
              />
              <div className="flex-1">
                <div className="font-semibold text-gray-900">정액 변경 (원)</div>
                <div className="text-xs text-gray-600">현재 요금에서 고정 금액 증감</div>
              </div>
              {changeMethod === 'fixed_amount' && (
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <select
                    value={adjustmentType}
                    onChange={(e) => setAdjustmentType(e.target.value as AdjustmentType)}
                    className="px-2.5 py-1.5 border border-gray-300 rounded text-sm"
                  >
                    <option value="increase">할증 (+)</option>
                    <option value="decrease">할인 (-)</option>
                  </select>
                  <input
                    type="number"
                    value={fixedAmountValue}
                    onChange={(e) => setFixedAmountValue(Number(e.target.value))}
                    className="w-24 px-2.5 py-1.5 border border-gray-300 rounded text-right text-sm"
                  />
                  <span className="text-sm">원</span>
                </div>
              )}
            </label>

            {/* 고정 금액 설정 */}
            <label
              className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => setChangeMethod('absolute')}
            >
              <input
                type="radio"
                name="changeMethod"
                value="absolute"
                checked={changeMethod === 'absolute'}
                onChange={() => setChangeMethod('absolute')}
                className="w-[18px] h-[18px]"
              />
              <div className="flex-1">
                <div className="font-semibold text-gray-900">고정 금액 설정</div>
                <div className="text-xs text-gray-600">그룹별로 동일한 금액 적용</div>
              </div>
            </label>
          </div>
        </div>

        {/* 고정 금액 입력 (absolute 선택시) */}
        {changeMethod === 'absolute' && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2.5">그룹별 고정 금액</h3>
            <div className="grid grid-cols-2 gap-3">
              {state.roomGroups.slice(0, 2).map((group) => (
                <div key={group.id}>
                  <label className="text-xs text-gray-600 block mb-1.5">{group.name}</label>
                  <input
                    type="number"
                    value={groupPrices[group.id] || 0}
                    onChange={(e) => handleGroupPriceChange(group.id, Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="금액 입력"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 적용 대상 */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-2.5">🎯 적용 대상</h3>
          <div className="space-y-2">
            {state.roomGroups.slice(0, 3).map((group) => {
              const groupRoomCount = group.roomIds.length;
              const avgPrice = Math.floor(Math.random() * 100000) + 100000;
              const isChecked = group.roomIds.some(id => selectedRoomIds.includes(id));

              return (
                <label key={group.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {
                      if (isChecked) {
                        setSelectedRoomIds(selectedRoomIds.filter(id => !group.roomIds.includes(id)));
                      } else {
                        setSelectedRoomIds([...selectedRoomIds, ...group.roomIds]);
                      }
                    }}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-gray-900">
                    {group.name} ({groupRoomCount}개) - 평균 {avgPrice.toLocaleString()}원
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        {/* 미리보기 */}
        {changeMethod !== 'absolute' && currentPrices.length > 0 && currentPrices[0]?.prices.length > 0 && (
          <div className="bg-green-50 border border-green-500 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2.5">📊 변경 후 예상 요금</h3>
            <div className="text-sm space-y-1.5">
              {currentPrices[0].prices.slice(0, 2).map((room, idx) => {
                const newPrice = calculatePreviewPrice(room.price);
                const diff = newPrice - room.price;
                const diffPercent = Math.round((diff / room.price) * 100);

                return (
                  <div key={idx} className="flex justify-between items-center">
                    <span className="text-gray-700">{room.roomName} ({currentPrices[0].date})</span>
                    <span>
                      <del className="text-gray-400">{room.price.toLocaleString()}원</del>
                      {' → '}
                      <strong className={diff > 0 ? 'text-red-700' : 'text-blue-700'}>
                        {newPrice.toLocaleString()}원 ({diff > 0 ? '+' : ''}{diffPercent}%)
                      </strong>
                    </span>
                  </div>
                );
              })}
              <div className="text-center mt-3 text-xs text-gray-600 pt-2 border-t border-green-200">
                총 {totalCombinations}개 날짜-객실 조합에 적용됩니다
              </div>
            </div>
          </div>
        )}

        {/* 안내 문구 */}
        <div className="bg-orange-50 p-3 rounded-lg text-sm text-gray-700">
          ⚠️ <strong>수동 설정</strong>으로 저장되어 향후 기본 요금 변경에 영향받지 않습니다.<br />
          시즌 종료 후 복원하려면 "기본값 복원" 기능을 사용하세요.
        </div>

        {/* 액션 버튼 */}
        <div className="flex gap-3 pt-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            취소
          </Button>
          <Button
            variant="primary"
            onClick={handleApply}
            disabled={!startDate || !endDate || selectedRoomIds.length === 0}
            className="flex-1"
          >
            적용
          </Button>
        </div>
      </div>
    </Modal>
  );
}
