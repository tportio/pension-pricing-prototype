import { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { usePricing } from '../../contexts/PricingContext';
import { formatKoreanDate } from '../../utils';
import type { Season, SeasonPriority } from '../../types';

interface SeasonModalProps {
  isOpen: boolean;
  onClose: () => void;
  season?: Season;
  mode: 'add' | 'edit' | 'copy';
}

export function SeasonModal({ isOpen, onClose, season, mode }: SeasonModalProps) {
  const { state, dispatch } = usePricing();

  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [priority, setPriority] = useState<SeasonPriority>('medium');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (season && (mode === 'edit' || mode === 'copy')) {
      setName(mode === 'copy' ? `${season.name} (복사)` : season.name);
      setStartDate(season.startDate);
      setEndDate(season.endDate);
      setPriority(season.priority);
      setDescription(season.description || '');
    } else {
      // Reset form
      setName('');
      setStartDate('');
      setEndDate('');
      setPriority('medium');
      setDescription('');
    }
  }, [season, mode, isOpen]);

  const handleSave = () => {
    if (!name) {
      alert('시즌 이름을 입력해주세요.');
      return;
    }

    // 기본 요금이 아닐 때만 날짜 검증
    if (!season?.isDefault) {
      if (!startDate || !endDate) {
        alert('시작일과 종료일을 입력해주세요.');
        return;
      }

      if (startDate > endDate) {
        alert('종료일은 시작일보다 늦어야 합니다.');
        return;
      }

      // Check for overlapping dates
      const overlapping = state.seasons.find(s => {
        if (mode === 'edit' && s.id === season?.id) return false;
        if (s.isDefault) return false;

        return (
          (startDate >= s.startDate && startDate <= s.endDate) ||
          (endDate >= s.startDate && endDate <= s.endDate) ||
          (startDate <= s.startDate && endDate >= s.endDate)
        );
      });

      if (overlapping) {
        alert(`기간이 겹칩니다: ${overlapping.name} (${overlapping.startDate} ~ ${overlapping.endDate})`);
        return;
      }
    }

    const newSeason: Season = {
      id: mode === 'edit' && season ? season.id : `season-${Date.now()}`,
      name,
      startDate: season?.isDefault ? (season.startDate || '') : startDate,
      endDate: season?.isDefault ? (season.endDate || '') : endDate,
      priority: season?.isDefault ? 'medium' : priority,
      description,
      roomPrices: season?.roomPrices || [],
      isDefault: season?.isDefault,
    };

    if (mode === 'edit') {
      dispatch({ type: 'UPDATE_SEASON', payload: newSeason });
    } else {
      dispatch({ type: 'ADD_SEASON', payload: newSeason });
    }

    onClose();
  };

  const title = season?.isDefault
    ? '기본 요금 수정'
    : mode === 'add'
    ? '새 시즌 추가'
    : mode === 'edit'
    ? '시즌 수정'
    : '시즌 복사';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="lg">
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

        {/* 기간 설정 - 기본 요금이 아닐 때만 표시 */}
        {!season?.isDefault && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  시작일 <span className="text-danger-500">*</span>
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  종료일 <span className="text-danger-500">*</span>
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            {startDate && endDate && (
              <div className="bg-primary-50 p-3 rounded-lg text-sm text-gray-700">
                {formatKoreanDate(new Date(startDate))} ~ {formatKoreanDate(new Date(endDate))}
              </div>
            )}
          </>
        )}

        {/* 기본 요금일 때 안내 */}
        {season?.isDefault && (
          <div className="bg-success-50 border-l-4 border-success-500 p-4 rounded-r-lg">
            <div className="text-sm text-gray-700">
              💡 기본 요금은 다른 시즌이 적용되지 않는 모든 날짜에 자동으로 적용됩니다.
            </div>
          </div>
        )}

        {/* 우선순위 - 기본 요금이 아닐 때만 표시 */}
        {!season?.isDefault && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              우선순위 <span className="text-danger-500">*</span>
            </label>
            <div className="flex gap-3">
              {(['low', 'medium', 'high'] as SeasonPriority[]).map((p) => (
                <label
                  key={p}
                  className="flex-1 flex items-center justify-center gap-2 p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                  style={{
                    borderColor: priority === p ? '#0ea5e9' : '#e5e7eb',
                    backgroundColor: priority === p ? '#f0f9ff' : 'white',
                  }}
                >
                  <input
                    type="radio"
                    name="priority"
                    value={p}
                    checked={priority === p}
                    onChange={(e) => setPriority(e.target.value as SeasonPriority)}
                    className="w-4 h-4 text-primary-600"
                  />
                  <Badge variant={p === 'high' ? 'danger' : p === 'medium' ? 'warning' : 'info'}>
                    {p === 'high' ? '높음' : p === 'medium' ? '중간' : '낮음'}
                  </Badge>
                </label>
              ))}
            </div>
            <p className="mt-2 text-xs text-gray-500">
              기간이 겹치는 경우 우선순위가 높은 시즌의 요금이 적용됩니다.
            </p>
          </div>
        )}

        {/* 설명 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            설명
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="예: 비수기 대비 20% 할증"
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        {/* 기존 시즌 목록 */}
        {state.seasons.filter(s => !s.isDefault).length > 0 && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm font-medium text-gray-700 mb-2">📅 기존 시즌 목록</div>
            <div className="space-y-1 text-xs">
              {state.seasons
                .filter(s => !s.isDefault)
                .sort((a, b) => a.startDate.localeCompare(b.startDate))
                .map(s => (
                  <div key={s.id} className="flex items-center justify-between text-gray-600">
                    <span>{s.name}</span>
                    <span className="text-gray-400">
                      {s.startDate} ~ {s.endDate}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* 액션 버튼 */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <Button variant="outline" onClick={onClose} className="flex-1">
            취소
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={!name || (!season?.isDefault && (!startDate || !endDate))}
            className="flex-1"
          >
            {mode === 'edit' ? '수정' : '추가'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
