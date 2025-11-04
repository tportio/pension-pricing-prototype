import { useState } from 'react';
import { usePricing } from '../../contexts/PricingContext';
import { Button } from '../common/Button';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SeasonTimelineProps {
  onSeasonClick?: (seasonId: string) => void;
}

export function SeasonTimeline({ onSeasonClick }: SeasonTimelineProps) {
  const { state } = usePricing();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // 선택된 연도의 시즌만 필터링 (기본 요금 제외, 날짜순 정렬)
  const seasons = state.seasons
    .filter(s => {
      if (s.isDefault) return false;
      const seasonYear = new Date(s.startDate).getFullYear();
      return seasonYear === selectedYear;
    })
    .sort((a, b) => a.startDate.localeCompare(b.startDate));

  // 월별 위치 계산 (선택된 연도의 1월 1일 기준)
  const getPositionPercent = (dateStr: string) => {
    const date = new Date(dateStr);
    const yearStart = new Date(selectedYear, 0, 1);
    const yearEnd = new Date(selectedYear, 11, 31);
    const totalDays = (yearEnd.getTime() - yearStart.getTime()) / (1000 * 60 * 60 * 24);
    const daysSinceStart = (date.getTime() - yearStart.getTime()) / (1000 * 60 * 60 * 24);
    return (daysSinceStart / totalDays) * 100;
  };

  // 기간 길이 계산 (선택된 연도 기준)
  const getWidthPercent = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const yearStart = new Date(selectedYear, 0, 1);
    const yearEnd = new Date(selectedYear, 11, 31);
    const totalDays = (yearEnd.getTime() - yearStart.getTime()) / (1000 * 60 * 60 * 24);
    const periodDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    return (periodDays / totalDays) * 100;
  };

  // 시즌별 고유 색상 (해시 기반)
  const getSeasonColor = (seasonId: string) => {
    const hash = seasonId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colors = [
      'bg-blue-200 border-blue-400',
      'bg-green-200 border-green-400',
      'bg-yellow-200 border-yellow-400',
      'bg-orange-200 border-orange-400',
      'bg-pink-200 border-pink-400',
      'bg-purple-200 border-purple-400',
      'bg-indigo-200 border-indigo-400',
    ];
    return colors[hash % colors.length];
  };

  const currentYear = new Date().getFullYear();

  return (
    <>
      {/* 연도 선택 네비게이션 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedYear(selectedYear - 1)}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="text-xl font-bold text-gray-900">
            {selectedYear}년
            {selectedYear === currentYear && (
              <span className="ml-2 text-sm font-normal text-primary-600">(현재)</span>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedYear(selectedYear + 1)}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        {selectedYear !== currentYear && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedYear(currentYear)}
          >
            현재 연도로
          </Button>
        )}
      </div>

      {/* 타임라인 */}
      <div className="relative h-24 bg-success-50 rounded-lg overflow-visible mb-4">
          {/* 기본 요금 배경 */}
          <div className="absolute inset-0 flex items-center justify-center text-success-700 font-semibold text-sm">
            기본 요금 (평시)
          </div>

          {/* 시즌들 */}
          {seasons.map((season) => {
            const left = getPositionPercent(season.startDate);
            const width = getWidthPercent(season.startDate, season.endDate);
            // 좁은 구간일 때 텍스트 숨김 처리
            const isNarrow = width < 8;

            return (
              <div
                key={season.id}
                className={`absolute top-0 h-full flex items-center justify-center border-l-2 border-r-2 ${getSeasonColor(season.id)} cursor-pointer hover:brightness-95 transition-all`}
                style={{
                  left: `${left}%`,
                  width: `${width}%`,
                }}
                onClick={() => onSeasonClick?.(season.id)}
                title={`${season.name} (${format(new Date(season.startDate), 'M/d', { locale: ko })} ~ ${format(new Date(season.endDate), 'M/d', { locale: ko })})`}
              >
                {!isNarrow && (
                  <div className="text-center px-1">
                    <div className="text-[10px] font-semibold text-gray-800 leading-tight">
                      {season.name.length > 8 ? `${season.name.substring(0, 6)}..` : season.name}
                    </div>
                    <div className="text-[9px] text-gray-600 leading-tight">
                      {format(new Date(season.startDate), 'M/d', { locale: ko })}~
                      {format(new Date(season.endDate), 'M/d', { locale: ko })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 월 표시 */}
        <div className="flex justify-between text-xs text-gray-500">
          {Array.from({ length: 12 }, (_, i) => (
            <span key={i}>{i + 1}월</span>
          ))}
        </div>

      {/* 시즌 목록 */}
      <div className="mt-6 space-y-3">
        {seasons.map((season) => (
          <div
            key={season.id}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
            onClick={() => onSeasonClick?.(season.id)}
          >
            <div className="flex items-center gap-3">
              <div className={`w-4 h-4 rounded ${getSeasonColor(season.id)}`} />
              <div>
                <div className="font-semibold text-gray-900">{season.name}</div>
                <div className="text-sm text-gray-600">
                  {format(new Date(season.startDate), 'yyyy년 M월 d일', { locale: ko })} ~{' '}
                  {format(new Date(season.endDate), 'yyyy년 M월 d일', { locale: ko })}
                </div>
              </div>
            </div>
            {season.description && (
              <span className="text-sm text-gray-500">{season.description}</span>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
