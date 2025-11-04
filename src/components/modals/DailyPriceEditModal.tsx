import { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { formatKoreanDate, formatPrice } from '../../utils';
import { usePricing } from '../../contexts/PricingContext';
import { CHANNEL_LABELS, PRICE_CHANGE_TYPE_LABELS } from '../../constants';
import type { Channel, PriceChangeType } from '../../types';

interface DailyPriceEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date | null;
}

export function DailyPriceEditModal({ isOpen, onClose, date }: DailyPriceEditModalProps) {
  const { state, getDailyPriceInfo, dispatch } = usePricing();
  const [selectedRoomPrices, setSelectedRoomPrices] = useState<
    Record<string, { price: number; adult: number; child: number; infant: number }>
  >({});
  const [showBulkEdit, setShowBulkEdit] = useState(false);
  const [bulkChangeType, setBulkChangeType] = useState<PriceChangeType>('percentage_increase');
  const [bulkValue, setBulkValue] = useState<number>(10);

  useEffect(() => {
    if (date) {
      const priceInfo = getDailyPriceInfo(date);
      const initialPrices: Record<string, any> = {};

      priceInfo.roomPrices.forEach((rp) => {
        const key = `${rp.roomId}-${rp.channel}`;
        initialPrices[key] = {
          price: rp.price,
          adult: rp.extraPersonPrices.adult,
          child: rp.extraPersonPrices.child,
          infant: rp.extraPersonPrices.infant,
        };
      });

      setSelectedRoomPrices(initialPrices);
    }
  }, [date, getDailyPriceInfo]);

  if (!date) return null;

  const priceInfo = getDailyPriceInfo(date);

  const handlePriceChange = (roomId: string, channel: Channel, field: string, value: number) => {
    const key = `${roomId}-${channel}`;
    setSelectedRoomPrices({
      ...selectedRoomPrices,
      [key]: {
        ...selectedRoomPrices[key],
        [field]: value,
      },
    });
  };

  const applyBulkChange = () => {
    if (!date) return;

    const priceInfo = getDailyPriceInfo(date);
    const updatedPrices: Record<string, any> = {};

    priceInfo.roomPrices.forEach((rp) => {
      const key = `${rp.roomId}-${rp.channel}`;
      const currentValues = selectedRoomPrices[key] || {
        price: rp.price,
        adult: rp.extraPersonPrices.adult,
        child: rp.extraPersonPrices.child,
        infant: rp.extraPersonPrices.infant,
      };

      const calculateNewPrice = (originalPrice: number): number => {
        switch (bulkChangeType) {
          case 'percentage_increase':
            return Math.round(originalPrice * (1 + bulkValue / 100));
          case 'percentage_decrease':
            return Math.round(originalPrice * (1 - bulkValue / 100));
          case 'amount_increase':
            return originalPrice + bulkValue;
          case 'amount_decrease':
            return originalPrice - bulkValue;
          case 'fixed':
            return bulkValue;
          default:
            return originalPrice;
        }
      };

      updatedPrices[key] = {
        price: calculateNewPrice(currentValues.price),
        adult: calculateNewPrice(currentValues.adult),
        child: calculateNewPrice(currentValues.child),
        infant: calculateNewPrice(currentValues.infant),
      };
    });

    setSelectedRoomPrices(updatedPrices);
    setShowBulkEdit(false);
  };

  const handleApply = () => {
    // TODO: 실제 수동 요금 저장 로직 구현
    const dateStr = date.toISOString().split('T')[0];

    Object.entries(selectedRoomPrices).forEach(([key, values]) => {
      const [roomId, channel] = key.split('-');
      const manualPrice = {
        id: `manual-${Date.now()}-${roomId}-${channel}`,
        date: dateStr,
        roomId,
        channel: channel as Channel,
        price: values.price,
        extraPersonPrices: {
          adult: values.adult,
          child: values.child,
          infant: values.infant,
        },
        reason: '수동 설정',
        createdAt: new Date().toISOString(),
      };

      dispatch({ type: 'ADD_MANUAL_PRICE', payload: manualPrice });
    });

    onClose();
  };

  // 객실별로 그룹화
  const groupedPrices = priceInfo.roomPrices.reduce((acc, rp) => {
    if (!acc[rp.roomName]) {
      acc[rp.roomName] = [];
    }
    acc[rp.roomName].push(rp);
    return acc;
  }, {} as Record<string, typeof priceInfo.roomPrices>);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`📝 ${formatKoreanDate(date)} 요금 수정`} size="xl">
      <div className="space-y-6">
        {/* 안내 */}
        <div className="bg-warning-50 border-l-4 border-warning-500 p-4 rounded-r-lg">
          <div className="text-sm text-gray-700">
            ⚠️ 수동으로 설정된 요금은 시즌 요금보다 우선 적용되며, 향후 기본 요금 변경에 영향받지 않습니다.
          </div>
        </div>

        {/* 일괄 수정 버튼 */}
        <div className="flex justify-end">
          <Button
            variant={showBulkEdit ? 'outline' : 'primary'}
            size="sm"
            onClick={() => setShowBulkEdit(!showBulkEdit)}
          >
            {showBulkEdit ? '일괄 수정 닫기' : '⚡ 일괄 수정'}
          </Button>
        </div>

        {/* 일괄 수정 패널 */}
        {showBulkEdit && (
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 space-y-4">
            <h3 className="font-semibold text-gray-900">⚡ 일괄 요금 조정</h3>

            {/* 변경 방식 선택 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                변경 방식
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(PRICE_CHANGE_TYPE_LABELS) as PriceChangeType[]).map((type) => (
                  <label
                    key={type}
                    className="flex items-center gap-2 p-2 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors text-sm"
                    style={{
                      borderColor: bulkChangeType === type ? '#0ea5e9' : '#e5e7eb',
                      backgroundColor: bulkChangeType === type ? '#f0f9ff' : 'white',
                    }}
                  >
                    <input
                      type="radio"
                      name="bulkChangeType"
                      value={type}
                      checked={bulkChangeType === type}
                      onChange={(e) => setBulkChangeType(e.target.value as PriceChangeType)}
                      className="w-4 h-4 text-primary-600"
                    />
                    <span>{PRICE_CHANGE_TYPE_LABELS[type]}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 값 입력 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {bulkChangeType.includes('percentage') ? '비율 (%)' : bulkChangeType === 'fixed' ? '고정 금액 (원)' : '금액 (원)'}
                </label>
                <input
                  type="number"
                  value={bulkValue}
                  onChange={(e) => setBulkValue(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder={bulkChangeType.includes('percentage') ? '예: 10' : '예: 10000'}
                  step={bulkChangeType.includes('percentage') ? '1' : '1000'}
                />
              </div>
              <div className="flex items-end">
                <Button
                  variant="primary"
                  onClick={applyBulkChange}
                  className="w-full"
                >
                  모든 요금에 적용
                </Button>
              </div>
            </div>

            {/* 설명 */}
            <div className="text-xs text-gray-600 bg-white p-3 rounded border border-gray-200">
              💡 현재 표시된 모든 객실/채널의 객실 요금 및 추가 인원 요금에 일괄 적용됩니다.
            </div>
          </div>
        )}

        {/* 객실별 요금 입력 */}
        <div className="space-y-4 max-h-[500px] overflow-y-auto">
          {Object.entries(groupedPrices).map(([roomName, roomPrices]) => (
            <div key={roomName} className="border border-gray-200 rounded-lg overflow-hidden">
              {/* 객실명 헤더 */}
              <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-200">
                <h4 className="font-semibold text-gray-900">{roomName}</h4>
              </div>

              {/* 채널별 요금 입력 */}
              <div className="p-4 space-y-4">
                {roomPrices.map((rp) => {
                  const key = `${rp.roomId}-${rp.channel}`;
                  const currentValues = selectedRoomPrices[key] || {
                    price: rp.price,
                    adult: rp.extraPersonPrices.adult,
                    child: rp.extraPersonPrices.child,
                    infant: rp.extraPersonPrices.infant,
                  };

                  return (
                    <div key={key} className="border border-gray-100 rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge variant={rp.channel === 'reservation' ? 'info' : 'success'}>
                          {CHANNEL_LABELS[rp.channel]}
                        </Badge>
                        <Badge
                          variant={
                            rp.appliedRule === 'manual'
                              ? 'warning'
                              : rp.appliedRule === 'season'
                              ? 'info'
                              : 'default'
                          }
                          className="text-xs"
                        >
                          {rp.appliedRule === 'manual'
                            ? '✏️ 수동'
                            : rp.appliedRule === 'season'
                            ? `🎯 ${rp.seasonName}`
                            : '📌 기본'}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            객실 요금 (원)
                          </label>
                          <input
                            type="number"
                            value={currentValues.price}
                            onChange={(e) =>
                              handlePriceChange(rp.roomId, rp.channel, 'price', Number(e.target.value))
                            }
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            step="1000"
                          />
                          <div className="text-xs text-gray-500 mt-1">
                            현재: {formatPrice(rp.price)}원
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            성인 추가 (원)
                          </label>
                          <input
                            type="number"
                            value={currentValues.adult}
                            onChange={(e) =>
                              handlePriceChange(rp.roomId, rp.channel, 'adult', Number(e.target.value))
                            }
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            step="1000"
                          />
                          <div className="text-xs text-gray-500 mt-1">
                            현재: {formatPrice(rp.extraPersonPrices.adult)}원
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            아동 추가 (원)
                          </label>
                          <input
                            type="number"
                            value={currentValues.child}
                            onChange={(e) =>
                              handlePriceChange(rp.roomId, rp.channel, 'child', Number(e.target.value))
                            }
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            step="1000"
                          />
                          <div className="text-xs text-gray-500 mt-1">
                            현재: {formatPrice(rp.extraPersonPrices.child)}원
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            유아 추가 (원)
                          </label>
                          <input
                            type="number"
                            value={currentValues.infant}
                            onChange={(e) =>
                              handlePriceChange(rp.roomId, rp.channel, 'infant', Number(e.target.value))
                            }
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            step="1000"
                          />
                          <div className="text-xs text-gray-500 mt-1">
                            현재: {formatPrice(rp.extraPersonPrices.infant)}원
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* 액션 버튼 */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <Button variant="outline" onClick={onClose} className="flex-1">
            취소
          </Button>
          <Button variant="primary" onClick={handleApply} className="flex-1">
            적용하기
          </Button>
        </div>
      </div>
    </Modal>
  );
}
