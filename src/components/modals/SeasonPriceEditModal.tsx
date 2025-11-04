import { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { DateRangesManager } from '../season/DateRangesManager';
import { RecurrenceSelector } from '../season/RecurrenceSelector';
import { usePricing } from '../../contexts/PricingContext';
import { formatKoreanDate } from '../../utils';
import { formatDate, calculatePriceFromPercentage } from '../../utils/seasonUtils';
import type { Season, DayType, DateRange, RecurrencePattern } from '../../types';

interface SeasonPriceEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  season?: Season;
  mode: 'add' | 'edit' | 'copy';
}

interface GroupPrices {
  weekday: { room: string; adult: string; child: string; infant: string };
  friday: { room: string; adult: string; child: string; infant: string };
  saturday: { room: string; adult: string; child: string; infant: string };
  sunday: { room: string; adult: string; child: string; infant: string };
}

export function SeasonPriceEditModal({ isOpen, onClose, season, mode }: SeasonPriceEditModalProps) {
  const { state, dispatch } = usePricing();

  const [name, setName] = useState('');
  const [dateRanges, setDateRanges] = useState<DateRange[]>([]);
  const [recurrence, setRecurrence] = useState<RecurrencePattern | undefined>();
  const [description, setDescription] = useState('');

  // 객실 그룹 활성화
  const [villaEnabled, setVillaEnabled] = useState(true);
  const [standardEnabled, setStandardEnabled] = useState(true);

  // 가격 입력 방식 (절대값 vs 퍼센트)
  const [pricingMethod, setPricingMethod] = useState<'absolute' | 'percentage'>('absolute');

  // 그룹별 요금
  const [villaPrices, setVillaPrices] = useState<GroupPrices>({
    weekday: { room: '100000', adult: '20000', child: '15000', infant: '0' },
    friday: { room: '120000', adult: '22000', child: '17000', infant: '0' },
    saturday: { room: '150000', adult: '25000', child: '20000', infant: '0' },
    sunday: { room: '130000', adult: '22000', child: '17000', infant: '0' },
  });

  const [standardPrices, setStandardPrices] = useState<GroupPrices>({
    weekday: { room: '80000', adult: '15000', child: '10000', infant: '0' },
    friday: { room: '100000', adult: '17000', child: '12000', infant: '0' },
    saturday: { room: '120000', adult: '20000', child: '15000', infant: '0' },
    sunday: { room: '100000', adult: '17000', child: '12000', infant: '0' },
  });

  useEffect(() => {
    if (season && (mode === 'edit' || mode === 'copy')) {
      setName(mode === 'copy' ? `${season.name} (복사)` : season.name);

      // dateRanges가 있으면 사용, 없으면 startDate/endDate로 생성
      if (season.dateRanges && season.dateRanges.length > 0) {
        setDateRanges(mode === 'copy'
          ? season.dateRanges.map(r => ({ ...r, id: `range-${Date.now()}-${Math.random()}` }))
          : season.dateRanges
        );
      } else {
        setDateRanges([{
          id: `range-${Date.now()}`,
          startDate: season.startDate || formatDate(new Date()),
          endDate: season.endDate || formatDate(new Date()),
        }]);
      }

      setRecurrence(season.recurrence);
      setDescription(season.description || '');

      // 기존 데이터에서 가격 로드
      const villaPrice = season.roomPrices.find(rp => rp.roomId.includes('villa'));
      const standardPrice = season.roomPrices.find(rp => rp.roomId.includes('standard'));

      if (villaPrice) {
        setVillaEnabled(true);
        setVillaPrices({
          weekday: {
            room: villaPrice.dayPrices.weekday.toString(),
            adult: villaPrice.extraPersonPrices.weekday.adult.toString(),
            child: villaPrice.extraPersonPrices.weekday.child.toString(),
            infant: villaPrice.extraPersonPrices.weekday.infant.toString(),
          },
          friday: {
            room: villaPrice.dayPrices.friday.toString(),
            adult: villaPrice.extraPersonPrices.friday.adult.toString(),
            child: villaPrice.extraPersonPrices.friday.child.toString(),
            infant: villaPrice.extraPersonPrices.friday.infant.toString(),
          },
          saturday: {
            room: villaPrice.dayPrices.saturday.toString(),
            adult: villaPrice.extraPersonPrices.saturday.adult.toString(),
            child: villaPrice.extraPersonPrices.saturday.child.toString(),
            infant: villaPrice.extraPersonPrices.saturday.infant.toString(),
          },
          sunday: {
            room: villaPrice.dayPrices.sunday.toString(),
            adult: villaPrice.extraPersonPrices.sunday.adult.toString(),
            child: villaPrice.extraPersonPrices.sunday.child.toString(),
            infant: villaPrice.extraPersonPrices.sunday.infant.toString(),
          },
        });
      }

      if (standardPrice) {
        setStandardEnabled(true);
        setStandardPrices({
          weekday: {
            room: standardPrice.dayPrices.weekday.toString(),
            adult: standardPrice.extraPersonPrices.weekday.adult.toString(),
            child: standardPrice.extraPersonPrices.weekday.child.toString(),
            infant: standardPrice.extraPersonPrices.weekday.infant.toString(),
          },
          friday: {
            room: standardPrice.dayPrices.friday.toString(),
            adult: standardPrice.extraPersonPrices.friday.adult.toString(),
            child: standardPrice.extraPersonPrices.friday.child.toString(),
            infant: standardPrice.extraPersonPrices.friday.infant.toString(),
          },
          saturday: {
            room: standardPrice.dayPrices.saturday.toString(),
            adult: standardPrice.extraPersonPrices.saturday.adult.toString(),
            child: standardPrice.extraPersonPrices.saturday.child.toString(),
            infant: standardPrice.extraPersonPrices.saturday.infant.toString(),
          },
          sunday: {
            room: standardPrice.dayPrices.sunday.toString(),
            adult: standardPrice.extraPersonPrices.sunday.adult.toString(),
            child: standardPrice.extraPersonPrices.sunday.child.toString(),
            infant: standardPrice.extraPersonPrices.sunday.infant.toString(),
          },
        });
      }
    } else {
      // Reset form
      setName('');
      const today = formatDate(new Date());
      setDateRanges([{
        id: `range-${Date.now()}`,
        startDate: today,
        endDate: today,
      }]);
      setRecurrence(undefined);
      setDescription('');
      setVillaEnabled(true);
      setStandardEnabled(true);
    }
  }, [season, mode, isOpen]);

  const handleSave = () => {
    if (!name) {
      alert('시즌 이름을 입력해주세요.');
      return;
    }

    // 기본 요금이 아닐 때만 날짜 검증
    if (!season?.isDefault) {
      if (dateRanges.length === 0) {
        alert('최소 1개 이상의 기간을 설정해주세요.');
        return;
      }

      // 각 기간 유효성 검증
      for (const range of dateRanges) {
        if (!range.startDate || !range.endDate) {
          alert('모든 기간의 시작일과 종료일을 입력해주세요.');
          return;
        }
        if (range.startDate > range.endDate) {
          alert('종료일은 시작일보다 늦어야 합니다.');
          return;
        }
      }
    }

    // 가격 데이터 생성
    const roomPrices = [];
    const villaRooms = state.rooms.filter(r => r.id.includes('villa'));
    const standardRooms = state.rooms.filter(r => r.id.includes('standard'));

    if (villaEnabled) {
      villaRooms.forEach(room => {
        room.channels.forEach(channel => {
          roomPrices.push({
            roomId: room.id,
            channel,
            dayPrices: {
              weekday: parseInt(villaPrices.weekday.room) || 0,
              friday: parseInt(villaPrices.friday.room) || 0,
              saturday: parseInt(villaPrices.saturday.room) || 0,
              sunday: parseInt(villaPrices.sunday.room) || 0,
            },
            extraPersonPrices: {
              weekday: {
                adult: parseInt(villaPrices.weekday.adult) || 0,
                child: parseInt(villaPrices.weekday.child) || 0,
                infant: parseInt(villaPrices.weekday.infant) || 0,
              },
              friday: {
                adult: parseInt(villaPrices.friday.adult) || 0,
                child: parseInt(villaPrices.friday.child) || 0,
                infant: parseInt(villaPrices.friday.infant) || 0,
              },
              saturday: {
                adult: parseInt(villaPrices.saturday.adult) || 0,
                child: parseInt(villaPrices.saturday.child) || 0,
                infant: parseInt(villaPrices.saturday.infant) || 0,
              },
              sunday: {
                adult: parseInt(villaPrices.sunday.adult) || 0,
                child: parseInt(villaPrices.sunday.child) || 0,
                infant: parseInt(villaPrices.sunday.infant) || 0,
              },
            },
          });
        });
      });
    }

    if (standardEnabled) {
      standardRooms.forEach(room => {
        room.channels.forEach(channel => {
          roomPrices.push({
            roomId: room.id,
            channel,
            dayPrices: {
              weekday: parseInt(standardPrices.weekday.room) || 0,
              friday: parseInt(standardPrices.friday.room) || 0,
              saturday: parseInt(standardPrices.saturday.room) || 0,
              sunday: parseInt(standardPrices.sunday.room) || 0,
            },
            extraPersonPrices: {
              weekday: {
                adult: parseInt(standardPrices.weekday.adult) || 0,
                child: parseInt(standardPrices.weekday.child) || 0,
                infant: parseInt(standardPrices.weekday.infant) || 0,
              },
              friday: {
                adult: parseInt(standardPrices.friday.adult) || 0,
                child: parseInt(standardPrices.friday.child) || 0,
                infant: parseInt(standardPrices.friday.infant) || 0,
              },
              saturday: {
                adult: parseInt(standardPrices.saturday.adult) || 0,
                child: parseInt(standardPrices.saturday.child) || 0,
                infant: parseInt(standardPrices.saturday.infant) || 0,
              },
              sunday: {
                adult: parseInt(standardPrices.sunday.adult) || 0,
                child: parseInt(standardPrices.sunday.child) || 0,
                infant: parseInt(standardPrices.sunday.infant) || 0,
              },
            },
          });
        });
      });
    }

    const newSeason: Season = {
      id: mode === 'edit' && season ? season.id : `season-${Date.now()}`,
      name,
      // 하위 호환성을 위해 첫 번째 기간을 startDate/endDate에 저장
      startDate: season?.isDefault
        ? (season.startDate || '')
        : (dateRanges[0]?.startDate || ''),
      endDate: season?.isDefault
        ? (season.endDate || '')
        : (dateRanges[0]?.endDate || ''),
      // 다중 기간 저장
      dateRanges: season?.isDefault ? undefined : dateRanges,
      // 반복 설정 저장
      recurrence: season?.isDefault ? undefined : recurrence,
      description,
      roomPrices,
      isDefault: season?.isDefault,
    };

    if (mode === 'edit') {
      dispatch({ type: 'UPDATE_SEASON', payload: newSeason });
    } else {
      dispatch({ type: 'ADD_SEASON', payload: newSeason });
    }

    onClose();
  };

  const updateGroupPrice = (
    group: 'villa' | 'standard',
    dayType: DayType,
    field: 'room' | 'adult' | 'child' | 'infant',
    value: string
  ) => {
    const setter = group === 'villa' ? setVillaPrices : setStandardPrices;
    const current = group === 'villa' ? villaPrices : standardPrices;

    setter({
      ...current,
      [dayType]: {
        ...current[dayType],
        [field]: value,
      },
    });
  };

  // 기본 요금 가져오기
  const getBasePrice = (roomType: 'villa' | 'standard', dayType: DayType): number => {
    const defaultSeason = state.seasons.find(s => s.isDefault);
    if (!defaultSeason) return 0;

    const roomPrice = defaultSeason.roomPrices.find(rp =>
      rp.roomId.includes(roomType)
    );
    if (!roomPrice) return 0;

    return roomPrice.dayPrices[dayType];
  };

  // 퍼센트 입력값으로부터 실제 가격 계산
  const calculateActualPrice = (percentage: string, basePrice: number): number => {
    const percentValue = parseFloat(percentage);
    if (isNaN(percentValue)) return basePrice;
    return calculatePriceFromPercentage(basePrice, percentValue);
  };

  const title = season?.isDefault
    ? '기본 요금 수정'
    : mode === 'add'
    ? '새 시즌 추가'
    : mode === 'edit'
    ? '시즌 수정'
    : '시즌 복사';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="xl">
      <div className="space-y-6">
        {/* 시즌 이름 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            시즌 이름 <span className="text-danger-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="예: 여름 성수기"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        {/* 기간 - 기본 요금이 아닐 때만 표시 */}
        {!season?.isDefault && (
          <DateRangesManager
            dateRanges={dateRanges}
            onChange={setDateRanges}
            existingSeasons={state.seasons}
            currentSeasonId={season?.id}
          />
        )}

        {/* 반복 설정 - 기본 요금이 아닐 때만 표시 */}
        {!season?.isDefault && (
          <RecurrenceSelector
            recurrence={recurrence}
            onChange={setRecurrence}
          />
        )}

        <div className="border-t-2 border-gray-200"></div>

        <div className="flex items-center justify-between mb-4">
          <div className="text-base font-semibold text-gray-900">적용 객실 그룹 및 요금</div>

          {/* 가격 입력 방식 토글 */}
          {!season?.isDefault && (
            <div className="flex items-center gap-3 bg-gray-100 p-2 rounded-lg">
              <span className="text-sm text-gray-700 font-medium">입력 방식:</span>
              <button
                type="button"
                onClick={() => setPricingMethod('absolute')}
                className={`px-3 py-1.5 text-sm font-medium rounded transition-all ${
                  pricingMethod === 'absolute'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                💰 절대값
              </button>
              <button
                type="button"
                onClick={() => setPricingMethod('percentage')}
                className={`px-3 py-1.5 text-sm font-medium rounded transition-all ${
                  pricingMethod === 'percentage'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                📊 기본요금 대비 %
              </button>
            </div>
          )}
        </div>

        {/* 퍼센트 모드 설명 */}
        {pricingMethod === 'percentage' && !season?.isDefault && (
          <div className="bg-info-50 border-l-4 border-info-500 p-3 rounded-r mb-4">
            <div className="text-sm text-info-900 font-medium mb-1">
              💡 퍼센트 기반 입력 모드
            </div>
            <div className="text-xs text-info-700">
              기본 요금 대비 증감 비율을 입력하세요. 예: +20 (20% 증가), -10 (10% 감소)
            </div>
          </div>
        )}

        {/* 독채 객실 그룹 */}
        <div className={`border-2 rounded-lg p-4 ${villaEnabled ? 'border-success-500 bg-success-50' : 'border-gray-300 bg-gray-50'}`}>
          <label className="flex items-center gap-3 mb-4 cursor-pointer">
            <input
              type="checkbox"
              checked={villaEnabled}
              onChange={(e) => setVillaEnabled(e.target.checked)}
              className="w-5 h-5 text-success-600"
            />
            <span className="text-base font-semibold text-gray-900">🏡 독채 객실 (10개)</span>
          </label>

          {villaEnabled && (
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-white border-b-2 border-success-200">
                  <th className="border border-gray-300 px-3 py-2 text-left font-semibold">요일</th>
                  <th className="border border-gray-300 px-3 py-2 text-center font-semibold">객실 기본요금</th>
                  <th className="border border-gray-300 px-3 py-2 text-center font-semibold">영유아</th>
                  <th className="border border-gray-300 px-3 py-2 text-center font-semibold">아동</th>
                  <th className="border border-gray-300 px-3 py-2 text-center font-semibold">성인</th>
                </tr>
              </thead>
              <tbody>
                {(['weekday', 'friday', 'saturday', 'sunday'] as DayType[]).map((dayType) => {
                  const dayLabel = dayType === 'weekday' ? '월~목' : dayType === 'friday' ? '금' : dayType === 'saturday' ? '토' : '일';
                  return (
                    <tr key={dayType} className="bg-white">
                      <td className="border border-gray-300 px-3 py-2 font-medium">{dayLabel}</td>
                      <td className="border border-gray-300 px-2 py-1">
                        <input
                          type="text"
                          value={villaPrices[dayType].room}
                          onChange={(e) => updateGroupPrice('villa', dayType, 'room', e.target.value)}
                          placeholder={pricingMethod === 'percentage' ? '+20 또는 -10' : '금액'}
                          className="w-full px-2 py-1 text-right border border-gray-300 rounded"
                        />
                        {pricingMethod === 'percentage' && villaPrices[dayType].room && (
                          <div className="text-xs text-success-700 mt-1 text-right font-medium">
                            → {calculateActualPrice(villaPrices[dayType].room, getBasePrice('villa', dayType)).toLocaleString()}원
                          </div>
                        )}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        <input
                          type="text"
                          value={villaPrices[dayType].infant}
                          onChange={(e) => updateGroupPrice('villa', dayType, 'infant', e.target.value)}
                          className="w-full px-2 py-1 text-right border border-gray-300 rounded"
                        />
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        <input
                          type="text"
                          value={villaPrices[dayType].child}
                          onChange={(e) => updateGroupPrice('villa', dayType, 'child', e.target.value)}
                          className="w-full px-2 py-1 text-right border border-gray-300 rounded"
                        />
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        <input
                          type="text"
                          value={villaPrices[dayType].adult}
                          onChange={(e) => updateGroupPrice('villa', dayType, 'adult', e.target.value)}
                          className="w-full px-2 py-1 text-right border border-gray-300 rounded"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* 스탠다드 객실 그룹 */}
        <div className={`border-2 rounded-lg p-4 ${standardEnabled ? 'border-primary-500 bg-primary-50' : 'border-gray-300 bg-gray-50'}`}>
          <label className="flex items-center gap-3 mb-4 cursor-pointer">
            <input
              type="checkbox"
              checked={standardEnabled}
              onChange={(e) => setStandardEnabled(e.target.checked)}
              className="w-5 h-5 text-primary-600"
            />
            <span className="text-base font-semibold text-gray-900">🏠 스탠다드 객실 (10개)</span>
          </label>

          {standardEnabled && (
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-white border-b-2 border-primary-200">
                  <th className="border border-gray-300 px-3 py-2 text-left font-semibold">요일</th>
                  <th className="border border-gray-300 px-3 py-2 text-center font-semibold">객실 기본요금</th>
                  <th className="border border-gray-300 px-3 py-2 text-center font-semibold">영유아</th>
                  <th className="border border-gray-300 px-3 py-2 text-center font-semibold">아동</th>
                  <th className="border border-gray-300 px-3 py-2 text-center font-semibold">성인</th>
                </tr>
              </thead>
              <tbody>
                {(['weekday', 'friday', 'saturday', 'sunday'] as DayType[]).map((dayType) => {
                  const dayLabel = dayType === 'weekday' ? '월~목' : dayType === 'friday' ? '금' : dayType === 'saturday' ? '토' : '일';
                  return (
                    <tr key={dayType} className="bg-white">
                      <td className="border border-gray-300 px-3 py-2 font-medium">{dayLabel}</td>
                      <td className="border border-gray-300 px-2 py-1">
                        <input
                          type="text"
                          value={standardPrices[dayType].room}
                          onChange={(e) => updateGroupPrice('standard', dayType, 'room', e.target.value)}
                          className="w-full px-2 py-1 text-right border border-gray-300 rounded"
                        />
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        <input
                          type="text"
                          value={standardPrices[dayType].infant}
                          onChange={(e) => updateGroupPrice('standard', dayType, 'infant', e.target.value)}
                          className="w-full px-2 py-1 text-right border border-gray-300 rounded"
                        />
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        <input
                          type="text"
                          value={standardPrices[dayType].child}
                          onChange={(e) => updateGroupPrice('standard', dayType, 'child', e.target.value)}
                          className="w-full px-2 py-1 text-right border border-gray-300 rounded"
                        />
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        <input
                          type="text"
                          value={standardPrices[dayType].adult}
                          onChange={(e) => updateGroupPrice('standard', dayType, 'adult', e.target.value)}
                          className="w-full px-2 py-1 text-right border border-gray-300 rounded"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* 설명 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            설명
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="예: 비수기 대비 20% 할증"
            rows={2}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        {/* 액션 버튼 */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <Button variant="outline" onClick={onClose} className="flex-1">
            취소
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={!name || (!season?.isDefault && dateRanges.length === 0)}
            className="flex-1"
          >
            {mode === 'edit' ? '수정' : '추가'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
