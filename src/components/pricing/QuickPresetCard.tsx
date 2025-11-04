import type { QuickPreset } from '../../types';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { getThisSaturday, formatDateKorean } from '../../constants';
import { Trash2 } from 'lucide-react';

interface QuickPresetCardProps {
  preset: QuickPreset;
  onClick: () => void;
  onDelete?: () => void;
}

export function QuickPresetCard({ preset, onClick, onDelete }: QuickPresetCardProps) {
  // 이번 주 토요일인 경우 실제 날짜 계산
  const displayName = preset.id === 'this-saturday'
    ? `이번 주 토요일 (${formatDateKorean(getThisSaturday())})`
    : preset.name;

  return (
    <div className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-primary-400 hover:shadow-md transition-all relative">
      {/* 뱃지 */}
      <div className="absolute top-3 right-3">
        {preset.isCustom ? (
          <Badge variant="primary" className="text-xs">내 템플릿</Badge>
        ) : (
          <Badge variant="default" className="text-xs">기본</Badge>
        )}
      </div>

      <div className="text-4xl mb-3">{preset.icon}</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2 pr-16">{displayName}</h3>
      {preset.description && (
        <p className="text-sm text-gray-600 mb-4">{preset.description}</p>
      )}
      {preset.dateRange && (
        <div className="text-xs text-gray-500 mb-4">
          {preset.dateRange.start} ~ {preset.dateRange.end}
        </div>
      )}

      <div className="flex gap-2">
        <Button variant="primary" size="sm" onClick={onClick} className="flex-1">
          설정하기
        </Button>
        {preset.isCustom && onDelete && (
          <Button
            variant="outline"
            size="sm"
            onClick={onDelete}
            className="px-3"
            title="템플릿 삭제"
          >
            <Trash2 className="w-4 h-4 text-gray-500" />
          </Button>
        )}
      </div>
    </div>
  );
}
