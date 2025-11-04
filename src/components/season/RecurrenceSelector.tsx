import { useState } from 'react';
import type { RecurrencePattern } from '../../types';
import { Badge } from '../common/Badge';
import { RefreshCw } from 'lucide-react';

interface RecurrenceSelectorProps {
  recurrence?: RecurrencePattern;
  onChange: (pattern?: RecurrencePattern) => void;
}

export function RecurrenceSelector({ recurrence, onChange }: RecurrenceSelectorProps) {
  const [isYearly, setIsYearly] = useState(recurrence?.type === 'yearly');
  const [startYear, setStartYear] = useState<string>(
    recurrence?.startYear?.toString() || new Date().getFullYear().toString()
  );
  const [endYear, setEndYear] = useState<string>(recurrence?.endYear?.toString() || '');
  const [isUnlimited, setIsUnlimited] = useState(!recurrence?.endYear);

  const handleYearlyToggle = (enabled: boolean) => {
    setIsYearly(enabled);

    if (enabled) {
      onChange({
        type: 'yearly',
        startYear: parseInt(startYear) || new Date().getFullYear(),
        endYear: isUnlimited ? undefined : parseInt(endYear) || undefined,
      });
    } else {
      onChange(undefined);
    }
  };

  const handleStartYearChange = (value: string) => {
    setStartYear(value);
    if (isYearly && value) {
      onChange({
        type: 'yearly',
        startYear: parseInt(value),
        endYear: isUnlimited ? undefined : parseInt(endYear) || undefined,
      });
    }
  };

  const handleEndYearChange = (value: string) => {
    setEndYear(value);
    if (isYearly) {
      onChange({
        type: 'yearly',
        startYear: parseInt(startYear) || new Date().getFullYear(),
        endYear: value ? parseInt(value) : undefined,
      });
    }
  };

  const handleUnlimitedToggle = (unlimited: boolean) => {
    setIsUnlimited(unlimited);
    if (isYearly) {
      onChange({
        type: 'yearly',
        startYear: parseInt(startYear) || new Date().getFullYear(),
        endYear: unlimited ? undefined : parseInt(endYear) || undefined,
      });
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <RefreshCw className="w-4 h-4 inline mr-1" />
          반복 설정
        </label>
        <p className="text-xs text-gray-500 mb-3">
          매년 같은 기간에 이 시즌을 자동으로 적용할 수 있습니다
        </p>
      </div>

      {/* 매년 반복 토글 */}
      <label className="flex items-center gap-3 cursor-pointer p-3 border-2 rounded-lg hover:bg-gray-50 transition-colors"
        style={{ borderColor: isYearly ? '#10b981' : '#d1d5db' }}>
        <input
          type="checkbox"
          checked={isYearly}
          onChange={(e) => handleYearlyToggle(e.target.checked)}
          className="w-5 h-5 text-success-600 rounded focus:ring-success-500"
        />
        <div className="flex-1">
          <div className="font-medium text-gray-900">🔄 매년 반복</div>
          <div className="text-xs text-gray-600">설정한 월-일을 매년 반복 적용</div>
        </div>
        {isYearly && (
          <Badge variant="success" className="text-xs">활성화</Badge>
        )}
      </label>

      {/* 반복 기간 설정 */}
      {isYearly && (
        <div className="bg-success-50 border border-success-200 rounded-lg p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                시작 연도
              </label>
              <input
                type="number"
                value={startYear}
                onChange={(e) => handleStartYearChange(e.target.value)}
                min={new Date().getFullYear()}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-success-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                종료 연도
              </label>
              <input
                type="number"
                value={endYear}
                onChange={(e) => handleEndYearChange(e.target.value)}
                disabled={isUnlimited}
                min={parseInt(startYear) || new Date().getFullYear()}
                placeholder="무제한"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-success-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
              />
            </div>
          </div>

          {/* 무제한 체크박스 */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isUnlimited}
              onChange={(e) => handleUnlimitedToggle(e.target.checked)}
              className="w-4 h-4 text-success-600 rounded focus:ring-success-500"
            />
            <span className="text-sm text-gray-700">종료 연도 없음 (무제한 반복)</span>
          </label>

          {/* 미리보기 */}
          <div className="bg-white border border-success-300 rounded p-3">
            <div className="text-xs font-medium text-success-900 mb-1">
              📅 반복 적용 범위
            </div>
            <div className="text-xs text-gray-700">
              {startYear}년부터 {isUnlimited ? '계속' : `${endYear}년까지`} 매년 같은 기간에 적용됩니다
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
