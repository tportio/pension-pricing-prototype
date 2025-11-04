import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { usePricing } from '../contexts/PricingContext';
import { Zap, Clock, Percent, Calendar, Plus, X, LayoutDashboard } from 'lucide-react';
import type { LastMinuteDiscount, ConsecutiveNightDiscount, ConsecutiveDiscountType } from '../types';

type PromotionId = 'overview' | 'last-minute' | 'consecutive-nights';

interface PromotionItem {
  id: PromotionId;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const PROMOTION_MENU: PromotionItem[] = [
  {
    id: 'overview',
    label: '프로모션 개요',
    icon: <LayoutDashboard className="w-5 h-5" />,
    description: '현재 설정된 모든 프로모션 정보를 한눈에 확인',
  },
  {
    id: 'last-minute',
    label: '마감 특가',
    icon: <Zap className="w-5 h-5" />,
    description: '체크인 직전 남은 객실에 대해 자동으로 할인 적용',
  },
  {
    id: 'consecutive-nights',
    label: '네이버 연박할인',
    icon: <Calendar className="w-5 h-5" />,
    description: '연속 숙박 시 자동으로 할인 적용',
  },
];

export function PromotionSettings() {
  const { state } = usePricing();
  const [selectedPromotion, setSelectedPromotion] = useState<PromotionId>('overview');

  // 마감 특가 설정 상태 (다중 항목 지원)
  const [lastMinuteDiscounts, setLastMinuteDiscounts] = useState<LastMinuteDiscount[]>([
    {
      id: 'last-minute-1',
      enabled: true,
      daysBeforeCheckIn: 3,
      discountPercentage: 20,
      targetChannels: ['reservation', 'online'],
      targetRoomIds: [],
    },
    {
      id: 'last-minute-2',
      enabled: true,
      daysBeforeCheckIn: 2,
      discountPercentage: 25,
      targetChannels: ['reservation', 'online'],
      targetRoomIds: [],
    },
    {
      id: 'last-minute-3',
      enabled: true,
      daysBeforeCheckIn: 1,
      discountPercentage: 30,
      targetChannels: ['reservation', 'online'],
      targetRoomIds: [],
    },
  ]);

  // 마감 특가 항목 추가
  const addLastMinuteDiscount = () => {
    const newId = `last-minute-${Date.now()}`;
    const newDiscount: LastMinuteDiscount = {
      id: newId,
      enabled: true,
      daysBeforeCheckIn: 1,
      discountPercentage: 15,
      targetChannels: ['reservation', 'online'],
      targetRoomIds: [],
    };
    setLastMinuteDiscounts([...lastMinuteDiscounts, newDiscount]);
  };

  // 마감 특가 항목 제거
  const removeLastMinuteDiscount = (id: string) => {
    if (lastMinuteDiscounts.length <= 1) {
      alert('최소 1개의 마감 특가 항목은 유지되어야 합니다.');
      return;
    }
    setLastMinuteDiscounts(lastMinuteDiscounts.filter((d) => d.id !== id));
  };

  // 마감 특가 항목 업데이트
  const updateLastMinuteDiscount = (id: string, updates: Partial<LastMinuteDiscount>) => {
    setLastMinuteDiscounts(
      lastMinuteDiscounts.map((d) => (d.id === id ? { ...d, ...updates } : d))
    );
  };

  // 연박 할인 설정 상태
  const [consecutiveDiscount, setConsecutiveDiscount] = useState<ConsecutiveNightDiscount>({
    id: 'consecutive-1',
    enabled: false,
    nights: 2,
    discountType: 'amount',
    discountValue: 10000,
    targetChannels: ['reservation', 'online'],
    targetRoomIds: [],
    description: '2박 이상 시 1만원 할인',
  });

  // 선택된 프로모션의 콘텐츠 렌더링
  const renderPromotionContent = () => {
    switch (selectedPromotion) {
      case 'overview':
        return renderOverviewSettings();
      case 'last-minute':
        return renderLastMinuteSettings();
      case 'consecutive-nights':
        return renderConsecutiveNightsSettings();
      default:
        return null;
    }
  };

  // 프로모션 개요
  const renderOverviewSettings = () => {
    const someEnabled = lastMinuteDiscounts.some((d) => d.enabled);
    const activeLastMinuteCount = lastMinuteDiscounts.filter((d) => d.enabled).length;

    return (
      <div className="space-y-6">
        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600 mb-1">마감 특가</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {activeLastMinuteCount} / {lastMinuteDiscounts.length}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">활성 항목 수</div>
                </div>
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                  someEnabled ? 'bg-warning-100' : 'bg-gray-100'
                }`}>
                  <Zap className={`w-8 h-8 ${someEnabled ? 'text-warning-600' : 'text-gray-400'}`} />
                </div>
              </div>
              {someEnabled && (
                <Badge variant="warning" className="mt-3">활성화됨</Badge>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600 mb-1">연박 할인</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {consecutiveDiscount.nights}박 이상
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {consecutiveDiscount.discountType === 'amount'
                      ? `${consecutiveDiscount.discountValue.toLocaleString()}원 할인`
                      : `${consecutiveDiscount.discountValue}% 할인`}
                  </div>
                </div>
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                  consecutiveDiscount.enabled ? 'bg-primary-100' : 'bg-gray-100'
                }`}>
                  <Calendar className={`w-8 h-8 ${consecutiveDiscount.enabled ? 'text-primary-600' : 'text-gray-400'}`} />
                </div>
              </div>
              {consecutiveDiscount.enabled ? (
                <Badge variant="primary" className="mt-3">활성화됨</Badge>
              ) : (
                <Badge variant="default" className="mt-3">비활성화</Badge>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 마감 특가 상세 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>⚡ 마감 특가 설정</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedPromotion('last-minute')}
              >
                설정 변경
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {someEnabled ? (
              <div className="space-y-3">
                <div className="text-sm text-gray-600 mb-4">
                  체크인 임박 시 자동으로 할인이 적용됩니다.
                </div>
                {lastMinuteDiscounts.filter(d => d.enabled).map((discount) => (
                  <div
                    key={discount.id}
                    className="flex items-center justify-between p-4 bg-warning-50 border border-warning-200 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-warning-100 rounded-full flex items-center justify-center">
                        <Clock className="w-6 h-6 text-warning-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">
                          체크인 {discount.daysBeforeCheckIn}일 전
                        </div>
                        <div className="text-sm text-gray-600">
                          {discount.discountPercentage}% 할인 자동 적용
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">적용 채널</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {discount.targetChannels.includes('reservation') && '🏠 예약창 '}
                        {discount.targetChannels.includes('online') && '🌐 온라인'}
                      </div>
                    </div>
                  </div>
                ))}
                {activeLastMinuteCount === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    활성화된 마감 특가 항목이 없습니다.
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">⚡</div>
                <div className="text-gray-600 mb-2">마감 특가가 비활성화되어 있습니다.</div>
                <div className="text-sm text-gray-500">
                  체크인 직전 남은 객실에 대해 자동 할인을 적용하려면 활성화하세요.
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 연박 할인 상세 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>📅 네이버 연박할인 설정</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedPromotion('consecutive-nights')}
              >
                설정 변경
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {consecutiveDiscount.enabled ? (
              <div className="space-y-3">
                <div className="text-sm text-gray-600 mb-4">
                  연속 숙박 시 자동으로 할인이 적용됩니다.
                </div>
                <div className="flex items-center justify-between p-4 bg-primary-50 border border-primary-200 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">
                        {consecutiveDiscount.nights}박 이상 연속 숙박
                      </div>
                      <div className="text-sm text-gray-600">
                        {consecutiveDiscount.discountType === 'amount'
                          ? `${consecutiveDiscount.discountValue.toLocaleString()}원 할인`
                          : `${consecutiveDiscount.discountValue}% 할인`} 자동 적용
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">적용 채널</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {consecutiveDiscount.targetChannels.includes('reservation') && '🏠 예약창 '}
                      {consecutiveDiscount.targetChannels.includes('online') && '🌐 온라인'}
                    </div>
                  </div>
                </div>
                {/* 적용 예시 */}
                <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                  <div className="text-sm font-semibold text-primary-900 mb-2">
                    📊 적용 예시
                  </div>
                  <div className="text-sm text-gray-700">
                    • 기본 요금: 100,000원 × {consecutiveDiscount.nights}박 = {(100000 * consecutiveDiscount.nights).toLocaleString()}원
                    <br />
                    • 할인 적용 후: {' '}
                    {consecutiveDiscount.discountType === 'amount'
                      ? `${(100000 * consecutiveDiscount.nights - consecutiveDiscount.discountValue).toLocaleString()}원`
                      : `${(100000 * consecutiveDiscount.nights * (1 - consecutiveDiscount.discountValue / 100)).toLocaleString()}원`}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">📅</div>
                <div className="text-gray-600 mb-2">연박 할인이 비활성화되어 있습니다.</div>
                <div className="text-sm text-gray-500">
                  장기 투숙을 유도하려면 연박 할인을 활성화하세요.
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  // 마감 특가 설정
  const renderLastMinuteSettings = () => {
    // 전체 활성화 상태 확인
    const allEnabled = lastMinuteDiscounts.every((d) => d.enabled);
    const someEnabled = lastMinuteDiscounts.some((d) => d.enabled);

    // 전체 토글
    const toggleAll = () => {
      const newEnabled = !allEnabled;
      setLastMinuteDiscounts(
        lastMinuteDiscounts.map((d) => ({ ...d, enabled: newEnabled }))
      );
    };

    return (
      <Card>
        <CardHeader>
          <CardTitle>⚡ 마감 특가 설정</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-sm text-gray-600 mb-4">
              체크인 직전 남은 객실에 대해 자동으로 할인을 적용하여 빈 객실을 최소화합니다.
            </div>

            {/* 전체 활성화 카드 */}
            <div
              className={`border-2 rounded-lg p-4 ${
                someEnabled
                  ? 'border-warning-500 bg-warning-50'
                  : 'border-gray-300 bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <label className="flex items-center gap-3 cursor-pointer flex-1">
                  <input
                    type="checkbox"
                    checked={allEnabled}
                    onChange={toggleAll}
                    className="w-5 h-5 text-warning-600 rounded"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">마감 특가 활성화</div>
                    <div className="text-xs text-gray-600">
                      체크인 임박 시 자동 할인 적용
                    </div>
                  </div>
                  {someEnabled && (
                    <Badge variant="warning" className="text-xs">활성화</Badge>
                  )}
                </label>
              </div>

              {someEnabled && (
                <>
                  {/* 할인 항목 목록 */}
                  <div className="space-y-3 mt-4 pt-4 border-t border-gray-200">
                    {lastMinuteDiscounts.map((discount, index) => (
                      <div
                        key={discount.id}
                        className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg p-3"
                      >
                        <div className="flex-1 grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              <Clock className="w-3 h-3 inline mr-1" />
                              체크인 N일 전
                            </label>
                            <input
                              type="number"
                              value={discount.daysBeforeCheckIn}
                              onChange={(e) =>
                                updateLastMinuteDiscount(discount.id, {
                                  daysBeforeCheckIn: parseInt(e.target.value),
                                })
                              }
                              min={1}
                              max={30}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              <Percent className="w-3 h-3 inline mr-1" />
                              할인율 (%)
                            </label>
                            <input
                              type="number"
                              value={discount.discountPercentage}
                              onChange={(e) =>
                                updateLastMinuteDiscount(discount.id, {
                                  discountPercentage: parseInt(e.target.value),
                                })
                              }
                              min={5}
                              max={50}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                            />
                          </div>
                        </div>

                        <button
                          onClick={() => removeLastMinuteDiscount(discount.id)}
                          disabled={lastMinuteDiscounts.length <= 1}
                          className={`p-2 rounded-lg transition-colors ${
                            lastMinuteDiscounts.length <= 1
                              ? 'text-gray-300 cursor-not-allowed'
                              : 'text-gray-500 hover:text-red-600 hover:bg-red-50'
                          }`}
                          title={lastMinuteDiscounts.length <= 1 ? '최소 1개 항목 필요' : '항목 제거'}
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ))}

                    {/* 항목 추가 버튼 */}
                    <button
                      onClick={addLastMinuteDiscount}
                      className="w-full py-2 px-3 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:border-warning-400 hover:text-warning-600 hover:bg-warning-50 transition-all flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      할인 항목 추가
                    </button>
                  </div>

                  {/* 적용 채널 */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      적용 채널
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          const includesReservation = lastMinuteDiscounts[0]?.targetChannels.includes('reservation');
                          setLastMinuteDiscounts(
                            lastMinuteDiscounts.map((d) => ({
                              ...d,
                              targetChannels: includesReservation
                                ? d.targetChannels.filter((c) => c !== 'reservation')
                                : [...d.targetChannels, 'reservation'],
                            }))
                          );
                        }}
                        className={`flex-1 px-3 py-2 text-sm rounded-lg border-2 transition-all ${
                          lastMinuteDiscounts[0]?.targetChannels.includes('reservation')
                            ? 'border-warning-500 bg-white text-warning-700 font-medium'
                            : 'border-gray-200 hover:border-gray-300 text-gray-700'
                        }`}
                      >
                        🏠 예약창
                      </button>
                      <button
                        onClick={() => {
                          const includesOnline = lastMinuteDiscounts[0]?.targetChannels.includes('online');
                          setLastMinuteDiscounts(
                            lastMinuteDiscounts.map((d) => ({
                              ...d,
                              targetChannels: includesOnline
                                ? d.targetChannels.filter((c) => c !== 'online')
                                : [...d.targetChannels, 'online'],
                            }))
                          );
                        }}
                        className={`flex-1 px-3 py-2 text-sm rounded-lg border-2 transition-all ${
                          lastMinuteDiscounts[0]?.targetChannels.includes('online')
                            ? 'border-warning-500 bg-white text-warning-700 font-medium'
                            : 'border-gray-200 hover:border-gray-300 text-gray-700'
                        }`}
                      >
                        🌐 온라인
                      </button>
                    </div>
                  </div>

                  {/* 적용 예시 */}
                  <div className="mt-4 bg-white border border-warning-300 rounded p-3">
                    <div className="text-xs font-medium text-warning-900 mb-2">
                      📊 적용 예시
                    </div>
                    <div className="space-y-1">
                      {lastMinuteDiscounts.slice().sort((a, b) => b.daysBeforeCheckIn - a.daysBeforeCheckIn).map((discount) => (
                        <div key={discount.id} className="text-xs text-gray-700">
                          • 체크인 {discount.daysBeforeCheckIn}일 전: 100,000원 →{' '}
                          {(100000 * (1 - discount.discountPercentage / 100)).toLocaleString()}원 ({discount.discountPercentage}% 할인)
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="bg-info-50 border-l-4 border-info-500 p-3 rounded-r">
              <div className="text-sm text-info-900 font-medium mb-1">
                💡 마감 특가 안내
              </div>
              <div className="text-xs text-info-700 space-y-1">
                <div>• 체크인일 기준으로 자동 계산되어 할인이 적용됩니다.</div>
                <div>• 이미 예약이 완료된 객실에는 적용되지 않습니다.</div>
                <div>• 다른 시즌 요금 및 수기 변경 요금과 중복 적용되지 않습니다.</div>
                <div>• 여러 마감 특가가 설정된 경우 해당 일수에 맞는 할인율이 적용됩니다.</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // 연박 할인 설정
  const renderConsecutiveNightsSettings = () => (
    <Card>
      <CardHeader>
        <CardTitle>📅 네이버 연박할인 설정</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-sm text-gray-600 mb-4">
            연속 숙박 시 자동으로 할인을 적용하여 장기 투숙을 유도합니다.
          </div>

          <div
            className={`border-2 rounded-lg p-4 ${
              consecutiveDiscount.enabled
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-300 bg-gray-50'
            }`}
          >
            <label className="flex items-center gap-3 mb-4 cursor-pointer">
              <input
                type="checkbox"
                checked={consecutiveDiscount.enabled}
                onChange={(e) =>
                  setConsecutiveDiscount({ ...consecutiveDiscount, enabled: e.target.checked })
                }
                className="w-5 h-5 text-primary-600 rounded"
              />
              <div className="flex-1">
                <div className="font-semibold text-gray-900">연박 할인 활성화</div>
                <div className="text-xs text-gray-600">N박 이상 시 자동 할인 적용</div>
              </div>
              {consecutiveDiscount.enabled && (
                <Badge variant="primary" className="text-xs">활성화</Badge>
              )}
            </label>

            {consecutiveDiscount.enabled && (
              <>
                <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      <Calendar className="w-3 h-3 inline mr-1" />
                      연박 기준 (N박 이상)
                    </label>
                    <input
                      type="number"
                      value={consecutiveDiscount.nights}
                      onChange={(e) =>
                        setConsecutiveDiscount({
                          ...consecutiveDiscount,
                          nights: parseInt(e.target.value),
                        })
                      }
                      min={2}
                      max={30}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      할인 방식
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() =>
                          setConsecutiveDiscount({
                            ...consecutiveDiscount,
                            discountType: 'amount',
                          })
                        }
                        className={`px-3 py-2 text-sm rounded-lg border-2 transition-all ${
                          consecutiveDiscount.discountType === 'amount'
                            ? 'border-primary-500 bg-white text-primary-700 font-medium'
                            : 'border-gray-200 hover:border-gray-300 text-gray-700'
                        }`}
                      >
                        정액
                      </button>
                      <button
                        onClick={() =>
                          setConsecutiveDiscount({
                            ...consecutiveDiscount,
                            discountType: 'percentage',
                          })
                        }
                        className={`px-3 py-2 text-sm rounded-lg border-2 transition-all ${
                          consecutiveDiscount.discountType === 'percentage'
                            ? 'border-primary-500 bg-white text-primary-700 font-medium'
                            : 'border-gray-200 hover:border-gray-300 text-gray-700'
                        }`}
                      >
                        정률
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    {consecutiveDiscount.discountType === 'amount' ? '할인 금액 (원)' : '할인율 (%)'}
                  </label>
                  <input
                    type="number"
                    value={consecutiveDiscount.discountValue}
                    onChange={(e) =>
                      setConsecutiveDiscount({
                        ...consecutiveDiscount,
                        discountValue: parseFloat(e.target.value),
                      })
                    }
                    min={0}
                    max={consecutiveDiscount.discountType === 'percentage' ? 50 : 100000}
                    step={consecutiveDiscount.discountType === 'amount' ? 1000 : 1}
                    placeholder={consecutiveDiscount.discountType === 'amount' ? '10000' : '10'}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                  />
                </div>

                <div className="mt-4">
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    적용 채널
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        setConsecutiveDiscount({
                          ...consecutiveDiscount,
                          targetChannels: consecutiveDiscount.targetChannels.includes('reservation')
                            ? consecutiveDiscount.targetChannels.filter((c) => c !== 'reservation')
                            : [...consecutiveDiscount.targetChannels, 'reservation'],
                        })
                      }
                      className={`flex-1 px-3 py-2 text-sm rounded-lg border-2 transition-all ${
                        consecutiveDiscount.targetChannels.includes('reservation')
                          ? 'border-primary-500 bg-white text-primary-700 font-medium'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      🏠 예약창
                    </button>
                    <button
                      onClick={() =>
                        setConsecutiveDiscount({
                          ...consecutiveDiscount,
                          targetChannels: consecutiveDiscount.targetChannels.includes('online')
                            ? consecutiveDiscount.targetChannels.filter((c) => c !== 'online')
                            : [...consecutiveDiscount.targetChannels, 'online'],
                        })
                      }
                      className={`flex-1 px-3 py-2 text-sm rounded-lg border-2 transition-all ${
                        consecutiveDiscount.targetChannels.includes('online')
                          ? 'border-primary-500 bg-white text-primary-700 font-medium'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      🌐 온라인
                    </button>
                  </div>
                </div>

                <div className="mt-4 bg-white border border-primary-300 rounded p-3">
                  <div className="text-xs font-medium text-primary-900 mb-1">
                    📊 적용 예시
                  </div>
                  <div className="text-xs text-gray-700">
                    {consecutiveDiscount.nights}박 이상 연속 숙박 시{' '}
                    {consecutiveDiscount.discountType === 'amount'
                      ? `${consecutiveDiscount.discountValue.toLocaleString()}원 할인`
                      : `${consecutiveDiscount.discountValue}% 할인`}{' '}
                    자동 적용
                    <br />
                    예: 100,000원 × {consecutiveDiscount.nights}박 = {(100000 * consecutiveDiscount.nights).toLocaleString()}원
                    {' → '}
                    {consecutiveDiscount.discountType === 'amount'
                      ? `${(100000 * consecutiveDiscount.nights - consecutiveDiscount.discountValue).toLocaleString()}원`
                      : `${(100000 * consecutiveDiscount.nights * (1 - consecutiveDiscount.discountValue / 100)).toLocaleString()}원`}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="bg-info-50 border-l-4 border-info-500 p-3 rounded-r">
            <div className="text-sm text-info-900 font-medium mb-1">
              💡 연박 할인 안내
            </div>
            <div className="text-xs text-info-700 space-y-1">
              <div>• 연속된 숙박 일수를 기준으로 자동 계산되어 할인이 적용됩니다.</div>
              <div>• 체크인-체크아웃 사이의 연속된 박 수를 기준으로 합니다.</div>
              <div>• 다른 프로모션 및 시즌 요금과 중복 적용 시 더 높은 할인율이 우선됩니다.</div>
            </div>
          </div>

          <div className="mt-4">
            <Button variant="primary" size="md" className="w-full">
              저장
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div className="bg-white border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">🎁 프로모션 설정</h1>
        <p className="text-sm text-gray-600 mt-1">
          다양한 프로모션과 할인 정책을 설정하여 예약률을 높이세요.
        </p>
      </div>

      {/* 좌우 분할 레이아웃 */}
      <div className="flex gap-6">
        {/* 왼쪽: 프로모션 메뉴 */}
        <aside className="w-80 flex-shrink-0">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="text-base">프로모션 목록</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <nav className="space-y-1">
                {PROMOTION_MENU.map((promotion) => (
                  <button
                    key={promotion.id}
                    onClick={() => setSelectedPromotion(promotion.id)}
                    className={`w-full text-left px-4 py-3 transition-all border-l-4 ${
                      selectedPromotion === promotion.id
                        ? 'bg-primary-50 border-primary-500 text-primary-900'
                        : 'bg-white border-transparent text-gray-700 hover:bg-gray-50 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`mt-0.5 ${
                          selectedPromotion === promotion.id ? 'text-primary-600' : 'text-gray-500'
                        }`}
                      >
                        {promotion.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div
                          className={`font-medium text-sm mb-0.5 ${
                            selectedPromotion === promotion.id ? 'text-primary-900' : 'text-gray-900'
                          }`}
                        >
                          {promotion.label}
                        </div>
                        <div className="text-xs text-gray-600 line-clamp-2">
                          {promotion.description}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </nav>
            </CardContent>
          </Card>
        </aside>

        {/* 오른쪽: 프로모션 상세 */}
        <div className="flex-1 min-w-0">{renderPromotionContent()}</div>
      </div>
    </div>
  );
}
