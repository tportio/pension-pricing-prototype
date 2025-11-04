import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Edit2, Trash2, Copy } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import type { Season } from '../../types';

interface SeasonCardProps {
  season: Season;
  onEdit?: () => void;
  onDelete?: () => void;
  onCopy?: () => void;
}

export function SeasonCard({ season, onEdit, onDelete, onCopy }: SeasonCardProps) {
  const priorityVariant = {
    low: 'info' as const,
    medium: 'warning' as const,
    high: 'danger' as const,
  };

  const priorityLabel = {
    low: '낮음',
    medium: '중간',
    high: '높음',
  };

  const isDefault = season.isDefault;

  return (
    <div
      className={`bg-white border-2 rounded-xl p-6 transition-all ${
        isDefault ? 'border-success-300 bg-success-50' : 'border-gray-200 hover:border-primary-300 hover:shadow-md'
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{season.name}</h3>
            {isDefault && (
              <Badge variant="success">기본 요금</Badge>
            )}
            {!isDefault && (
              <Badge variant={priorityVariant[season.priority]}>
                우선순위: {priorityLabel[season.priority]}
              </Badge>
            )}
          </div>
          {season.description && (
            <p className="text-sm text-gray-600 mb-3">{season.description}</p>
          )}
        </div>
      </div>

      {!isDefault && (
        <div className="mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
            <span className="font-medium">기간:</span>
            <span>
              {format(new Date(season.startDate), 'yyyy년 M월 d일', { locale: ko })} ~{' '}
              {format(new Date(season.endDate), 'yyyy년 M월 d일', { locale: ko })}
            </span>
          </div>
        </div>
      )}

      {/* 객실 그룹별 요금 표시 */}
      <div className="border-t border-gray-200 pt-4">
        <div className="text-sm font-medium text-gray-700 mb-3">적용 객실 및 요금</div>

        {season.roomPrices.length > 0 ? (
          <div className="space-y-3">
            {/* 독채 객실 그룹 */}
            {season.roomPrices.some(rp => rp.roomId.includes('villa')) && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="font-medium text-sm text-gray-900 mb-2">
                  ✅ 독채 객실 ({season.roomPrices.filter(rp => rp.roomId.includes('villa')).length}개)
                </div>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-green-200">
                      <th className="px-2 py-1 text-left text-gray-600 font-medium">요일</th>
                      <th className="px-2 py-1 text-right text-gray-600 font-medium">객실요금</th>
                      <th className="px-2 py-1 text-right text-gray-600 font-medium">성인</th>
                      <th className="px-2 py-1 text-right text-gray-600 font-medium">아동</th>
                    </tr>
                  </thead>
                  <tbody>
                    {['weekday', 'friday', 'saturday', 'sunday'].map((dayType) => {
                      const samplePrice = season.roomPrices.find(rp => rp.roomId.includes('villa'));
                      if (!samplePrice) return null;
                      const price = samplePrice.dayPrices[dayType as 'weekday' | 'friday' | 'saturday' | 'sunday'];
                      const extra = samplePrice.extraPersonPrices[dayType as 'weekday' | 'friday' | 'saturday' | 'sunday'];
                      const dayLabel = dayType === 'weekday' ? '월~목' : dayType === 'friday' ? '금' : dayType === 'saturday' ? '토' : '일';
                      return (
                        <tr key={dayType} className="border-b border-green-100">
                          <td className="px-2 py-1 text-gray-700">{dayLabel}</td>
                          <td className="px-2 py-1 text-right font-semibold text-gray-900">{price.toLocaleString()}원</td>
                          <td className="px-2 py-1 text-right text-gray-600">{extra.adult.toLocaleString()}원</td>
                          <td className="px-2 py-1 text-right text-gray-600">{extra.child.toLocaleString()}원</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* 스탠다드 객실 그룹 */}
            {season.roomPrices.some(rp => rp.roomId.includes('standard')) && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="font-medium text-sm text-gray-900 mb-2">
                  ✅ 스탠다드 객실 ({season.roomPrices.filter(rp => rp.roomId.includes('standard')).length}개)
                </div>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-blue-200">
                      <th className="px-2 py-1 text-left text-gray-600 font-medium">요일</th>
                      <th className="px-2 py-1 text-right text-gray-600 font-medium">객실요금</th>
                      <th className="px-2 py-1 text-right text-gray-600 font-medium">성인</th>
                      <th className="px-2 py-1 text-right text-gray-600 font-medium">아동</th>
                    </tr>
                  </thead>
                  <tbody>
                    {['weekday', 'friday', 'saturday', 'sunday'].map((dayType) => {
                      const samplePrice = season.roomPrices.find(rp => rp.roomId.includes('standard'));
                      if (!samplePrice) return null;
                      const price = samplePrice.dayPrices[dayType as 'weekday' | 'friday' | 'saturday' | 'sunday'];
                      const extra = samplePrice.extraPersonPrices[dayType as 'weekday' | 'friday' | 'saturday' | 'sunday'];
                      const dayLabel = dayType === 'weekday' ? '월~목' : dayType === 'friday' ? '금' : dayType === 'saturday' ? '토' : '일';
                      return (
                        <tr key={dayType} className="border-b border-blue-100">
                          <td className="px-2 py-1 text-gray-700">{dayLabel}</td>
                          <td className="px-2 py-1 text-right font-semibold text-gray-900">{price.toLocaleString()}원</td>
                          <td className="px-2 py-1 text-right text-gray-600">{extra.adult.toLocaleString()}원</td>
                          <td className="px-2 py-1 text-right text-gray-600">{extra.child.toLocaleString()}원</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div className="text-sm text-gray-500 text-center py-4">
            아직 설정된 요금이 없습니다.
          </div>
        )}
      </div>

      <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
        {isDefault ? (
          <>
            {onEdit && (
              <Button variant="primary" size="sm" onClick={onEdit} className="flex-1">
                <Edit2 className="w-4 h-4 mr-1" />
                기본 요금 수정
              </Button>
            )}
          </>
        ) : (
          <>
            {onEdit && (
              <Button variant="outline" size="sm" onClick={onEdit} className="flex-1">
                <Edit2 className="w-4 h-4 mr-1" />
                수정
              </Button>
            )}
            {onCopy && (
              <Button variant="outline" size="sm" onClick={onCopy} className="flex-1">
                <Copy className="w-4 h-4 mr-1" />
                복사
              </Button>
            )}
            {onDelete && (
              <Button variant="danger" size="sm" onClick={onDelete} className="flex-1">
                <Trash2 className="w-4 h-4 mr-1" />
                삭제
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
