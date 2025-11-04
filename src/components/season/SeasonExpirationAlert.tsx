import { AlertCircle, Calendar, X } from 'lucide-react';
import { usePricing } from '../../contexts/PricingContext';
import { getSeasonsNearEnd } from '../../utils/seasonUtils';
import { formatKoreanDate } from '../../utils';
import { Badge } from '../common/Badge';

interface SeasonExpirationAlertProps {
  daysBeforeEnd?: number;
}

export function SeasonExpirationAlert({ daysBeforeEnd = 30 }: SeasonExpirationAlertProps) {
  const { state, dispatch } = usePricing();

  // 종료 임박 시즌 가져오기
  const expiringSeasonsData = getSeasonsNearEnd(state.seasons, daysBeforeEnd);

  // 알림이 있는 시즌만 필터링
  const expiringSeasons = expiringSeasonsData.filter(season => season.notifyBeforeDays);

  if (expiringSeasons.length === 0) {
    return null;
  }

  const handleDismiss = (seasonId: string) => {
    // 마지막 알림 시각 업데이트
    dispatch({
      type: 'UPDATE_SEASON',
      payload: {
        ...state.seasons.find(s => s.id === seasonId)!,
        lastNotifiedAt: new Date().toISOString(),
      },
    });
  };

  return (
    <div className="space-y-3 mb-6">
      {expiringSeasons.map((season) => {
        const dateRanges = season.dateRanges || [{
          id: 'legacy',
          startDate: season.startDate,
          endDate: season.endDate,
        }];

        // 가장 늦은 종료일 찾기
        let latestEndDate = new Date(dateRanges[0].endDate);
        for (const range of dateRanges) {
          const endDate = new Date(range.endDate);
          if (endDate > latestEndDate) {
            latestEndDate = endDate;
          }
        }

        const today = new Date();
        const daysUntilEnd = Math.floor((latestEndDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        // 이미 알림을 본 경우 (24시간 이내) 표시하지 않음
        if (season.lastNotifiedAt) {
          const lastNotified = new Date(season.lastNotifiedAt);
          const hoursSinceNotification = (today.getTime() - lastNotified.getTime()) / (1000 * 60 * 60);
          if (hoursSinceNotification < 24) {
            return null;
          }
        }

        return (
          <div
            key={season.id}
            className="bg-warning-50 border-l-4 border-warning-500 p-4 rounded-r-lg shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1">
                <AlertCircle className="w-5 h-5 text-warning-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-warning-900">
                      시즌 종료 임박
                    </h4>
                    <Badge variant="warning" className="text-xs">
                      {daysUntilEnd}일 남음
                    </Badge>
                  </div>

                  <p className="text-sm text-warning-800 mb-2">
                    <strong>"{season.name}"</strong> 시즌이 곧 종료됩니다.
                  </p>

                  <div className="flex items-center gap-2 text-xs text-warning-700">
                    <Calendar className="w-4 h-4" />
                    <span>
                      종료일: {formatKoreanDate(latestEndDate)}
                    </span>
                  </div>

                  {season.recurrence && season.recurrence.type === 'yearly' && (
                    <div className="mt-2 text-xs text-warning-700 bg-warning-100 px-2 py-1 rounded inline-block">
                      🔄 매년 반복 설정됨 - 다음 해에 자동으로 적용됩니다
                    </div>
                  )}

                  {!season.recurrence && (
                    <div className="mt-2 text-xs text-warning-800">
                      💡 반복 설정을 추가하여 매년 자동으로 적용되도록 할 수 있습니다.
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={() => handleDismiss(season.id)}
                className="text-warning-600 hover:text-warning-800 p-1 rounded hover:bg-warning-100 transition-colors flex-shrink-0"
                title="24시간 동안 숨기기"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
