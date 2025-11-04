import { useState } from 'react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import type { DateRange, Season } from '../../types';
import { Plus, Trash2, AlertCircle } from 'lucide-react';
import { checkDateRangeOverlap, checkMultipleDateRangesOverlap, formatDate } from '../../utils/seasonUtils';
import { formatKoreanDate } from '../../utils';

interface DateRangesManagerProps {
  dateRanges: DateRange[];
  onChange: (ranges: DateRange[]) => void;
  existingSeasons?: Season[]; // 중복 검증용
  currentSeasonId?: string; // 수정 모드일 때 현재 시즌 ID
}

export function DateRangesManager({
  dateRanges,
  onChange,
  existingSeasons = [],
  currentSeasonId
}: DateRangesManagerProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleAddRange = () => {
    const today = new Date();
    const newRange: DateRange = {
      id: `range-${Date.now()}`,
      startDate: formatDate(today),
      endDate: formatDate(today),
    };
    onChange([...dateRanges, newRange]);
  };

  const handleRemoveRange = (id: string) => {
    onChange(dateRanges.filter(r => r.id !== id));
    // 에러도 제거
    const newErrors = { ...errors };
    delete newErrors[id];
    setErrors(newErrors);
  };

  const handleRangeChange = (id: string, field: 'startDate' | 'endDate', value: string) => {
    const updatedRanges = dateRanges.map(r =>
      r.id === id ? { ...r, [field]: value } : r
    );
    onChange(updatedRanges);

    // 유효성 검증
    validateRange(id, updatedRanges);
  };

  const validateRange = (rangeId: string, ranges: DateRange[]) => {
    const newErrors: Record<string, string> = { ...errors };
    const range = ranges.find(r => r.id === rangeId);

    if (!range) return;

    // 1. 시작일 > 종료일 체크
    if (range.startDate > range.endDate) {
      newErrors[rangeId] = '종료일은 시작일보다 늦어야 합니다';
      setErrors(newErrors);
      return;
    }

    // 2. 같은 시즌 내 다른 기간과 중복 체크
    const otherRanges = ranges.filter(r => r.id !== rangeId);
    for (const otherRange of otherRanges) {
      if (checkDateRangeOverlap(range, otherRange)) {
        newErrors[rangeId] = '시즌 내 다른 기간과 겹칩니다';
        setErrors(newErrors);
        return;
      }
    }

    // 3. 다른 시즌과 중복 체크
    const otherSeasons = existingSeasons.filter(s =>
      !s.isDefault && s.id !== currentSeasonId
    );

    for (const season of otherSeasons) {
      const seasonRanges = season.dateRanges || [{
        id: 'legacy',
        startDate: season.startDate,
        endDate: season.endDate,
      }];

      for (const seasonRange of seasonRanges) {
        if (checkDateRangeOverlap(range, seasonRange)) {
          newErrors[rangeId] = `"${season.name}" 시즌과 겹칩니다`;
          setErrors(newErrors);
          return;
        }
      }
    }

    // 에러 없음
    delete newErrors[rangeId];
    setErrors(newErrors);
  };

  // 전체 유효성 체크
  const hasErrors = Object.keys(errors).length > 0;
  const hasInternalOverlap = checkMultipleDateRangesOverlap(dateRanges);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            시즌 기간 설정
            <span className="text-danger-500 ml-1">*</span>
          </label>
          <p className="text-xs text-gray-500">
            1개 시즌에 여러 기간을 설정할 수 있습니다 (예: 여름/겨울 준성수기)
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleAddRange}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          기간 추가
        </Button>
      </div>

      {hasInternalOverlap && (
        <div className="bg-danger-50 border-l-4 border-danger-500 p-3 rounded-r">
          <div className="flex items-center gap-2 text-sm text-danger-800">
            <AlertCircle className="w-4 h-4" />
            <span>시즌 내 기간들이 서로 겹칩니다. 각 기간을 확인해주세요.</span>
          </div>
        </div>
      )}

      {dateRanges.length === 0 && (
        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <div className="text-gray-500 mb-2">설정된 기간이 없습니다</div>
          <Button variant="outline" size="sm" onClick={handleAddRange}>
            <Plus className="w-4 h-4 mr-1" />
            첫 기간 추가하기
          </Button>
        </div>
      )}

      <div className="space-y-3">
        {dateRanges.map((range, index) => (
          <div
            key={range.id}
            className={`border rounded-lg p-4 ${
              errors[range.id] ? 'border-danger-300 bg-danger-50' : 'border-gray-300 bg-white'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 pt-2">
                <Badge variant="default" className="text-sm font-semibold">
                  {index + 1}
                </Badge>
              </div>

              <div className="flex-1 grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    시작일
                  </label>
                  <input
                    type="date"
                    value={range.startDate}
                    onChange={(e) => handleRangeChange(range.id, 'startDate', e.target.value)}
                    className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      errors[range.id] ? 'border-danger-300' : 'border-gray-300'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    종료일
                  </label>
                  <input
                    type="date"
                    value={range.endDate}
                    onChange={(e) => handleRangeChange(range.id, 'endDate', e.target.value)}
                    className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      errors[range.id] ? 'border-danger-300' : 'border-gray-300'
                    }`}
                  />
                </div>
              </div>

              <div className="flex-shrink-0 pt-7">
                <button
                  onClick={() => handleRemoveRange(range.id)}
                  className="text-danger-600 hover:text-danger-800 p-2 rounded hover:bg-danger-50 transition-colors"
                  disabled={dateRanges.length === 1}
                  title="기간 삭제"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 기간 미리보기 */}
            {range.startDate && range.endDate && !errors[range.id] && (
              <div className="mt-2 pl-10 text-sm text-gray-600">
                📅 {formatKoreanDate(new Date(range.startDate))} ~ {formatKoreanDate(new Date(range.endDate))}
              </div>
            )}

            {/* 에러 메시지 */}
            {errors[range.id] && (
              <div className="mt-2 pl-10 flex items-center gap-2 text-sm text-danger-700">
                <AlertCircle className="w-4 h-4" />
                <span>{errors[range.id]}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 전체 요약 */}
      {dateRanges.length > 1 && !hasErrors && (
        <div className="bg-success-50 border border-success-200 rounded-lg p-3">
          <div className="text-sm font-medium text-success-900 mb-1">
            ✓ 총 {dateRanges.length}개 기간 설정됨
          </div>
          <div className="text-xs text-success-700">
            모든 기간이 겹치지 않으며 유효합니다
          </div>
        </div>
      )}
    </div>
  );
}
