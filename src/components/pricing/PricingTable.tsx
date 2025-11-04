import { Fragment, useState } from 'react';
import { usePricing } from '../../contexts/PricingContext';
import { Card, CardHeader, CardTitle, CardContent } from '../common/Card';
import { Button } from '../common/Button';
import { formatPrice } from '../../utils';
import { DAY_ORDER } from '../../constants';
import { Calendar, Globe, Maximize2, X } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import type { Channel } from '../../types';

// 요일 표기 변경
const DAY_LABELS_SHORT = {
  weekday: '월~목',
  friday: '금',
  saturday: '토',
  sunday: '일',
};

// 시즌별 배경색 (연한 음영)
const getSeasonColor = (seasonId: string, isDefault?: boolean) => {
  if (isDefault) return 'bg-gray-50';

  // 시즌 ID 해시를 기반으로 색상 선택
  const hash = seasonId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const colors = [
    'bg-blue-50',
    'bg-green-50',
    'bg-yellow-50',
    'bg-orange-50',
    'bg-pink-50',
    'bg-purple-50',
    'bg-indigo-50',
  ];
  return colors[hash % colors.length];
};

interface PricingTableProps {
  selectedChannels: Channel[];
}

export function PricingTable({ selectedChannels }: PricingTableProps) {
  const { state } = usePricing();
  const [isFullscreen, setIsFullscreen] = useState(false);

  // 표시할 시즌들 (기본 요금 포함, 날짜순 정렬)
  const seasons = state.seasons.sort((a, b) => {
    if (a.isDefault) return -1;
    if (b.isDefault) return 1;
    return a.startDate.localeCompare(b.startDate);
  });

  // 표시할 객실들 (대표 객실만 - 각 그룹별 1개씩)
  const representativeRooms = [
    state.rooms.find(r => r.id === 'room-standard-1'), // 스탠다드 대표
    state.rooms.find(r => r.id === 'room-villa-1'), // 독채 최저가
    state.rooms.find(r => r.id === 'room-villa-5'), // 독채 중간가
    state.rooms.find(r => r.id === 'room-villa-10'), // 독채 최고가
  ].filter(Boolean);

  // 테이블 콘텐츠 렌더링 함수
  const renderTableContent = () => (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-gray-50">
            <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-700 sticky left-0 bg-gray-50 z-10">
              객실
            </th>
            <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">
              채널
            </th>
            <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">
              요일
            </th>
            {seasons.map((season) => (
              <th
                key={season.id}
                className="border border-gray-200 px-4 py-3 text-center font-semibold text-gray-700"
                colSpan={4}
              >
                <div>{season.name}</div>
                {!season.isDefault && (
                  <div className="text-xs font-normal text-gray-500 mt-1">
                    {format(new Date(season.startDate), 'M/d', { locale: ko })} ~ {format(new Date(season.endDate), 'M/d', { locale: ko })}
                  </div>
                )}
              </th>
            ))}
          </tr>
          <tr className="bg-gray-50 text-xs">
            <th className="border border-gray-200 px-2 py-2"></th>
            <th className="border border-gray-200 px-2 py-2"></th>
            <th className="border border-gray-200 px-2 py-2"></th>
            {seasons.map((season) => (
              <Fragment key={season.id}>
                <th className="border border-gray-200 px-2 py-1 text-gray-600">객실요금</th>
                <th className="border border-gray-200 px-2 py-1 text-gray-600">성인</th>
                <th className="border border-gray-200 px-2 py-1 text-gray-600">아동</th>
                <th className="border border-gray-200 px-2 py-1 text-gray-600">유아</th>
              </Fragment>
            ))}
          </tr>
        </thead>
        <tbody>
          {representativeRooms.map((room) => {
            if (!room) return null;

            // 해당 객실의 채널들
            const roomChannels = room.channels.filter(ch => selectedChannels.includes(ch));

            return roomChannels.map((channel, channelIdx) => (
              <Fragment key={`${room.id}-${channel}`}>
                {DAY_ORDER.map((dayType, dayIdx) => (
                  <tr
                    key={`${room.id}-${channel}-${dayType}`}
                    className="hover:bg-gray-50"
                  >
                    {/* 객실명 (첫 번째 채널의 첫 번째 요일에만 표시) */}
                    {channelIdx === 0 && dayIdx === 0 && (
                      <td
                        className="border border-gray-200 px-4 py-2 font-medium text-gray-900 sticky left-0 bg-white"
                        rowSpan={roomChannels.length * DAY_ORDER.length}
                      >
                        {room.name}
                      </td>
                    )}

                    {/* 채널 (각 채널의 첫 번째 요일에만 표시) - 아이콘으로 표시 */}
                    {dayIdx === 0 && (
                      <td
                        className="border border-gray-200 px-4 py-2 text-center"
                        rowSpan={DAY_ORDER.length}
                      >
                        <div
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg transition-colors cursor-help"
                          style={{
                            backgroundColor: channel === 'reservation' ? '#e0f2fe' : '#dcfce7',
                            color: channel === 'reservation' ? '#0284c7' : '#16a34a',
                          }}
                          title={channel === 'reservation' ? '예약창' : '온라인'}
                        >
                          {channel === 'reservation' ? (
                            <Calendar className="w-4 h-4" />
                          ) : (
                            <Globe className="w-4 h-4" />
                          )}
                        </div>
                      </td>
                    )}

                    {/* 요일 - 간결한 표기로 변경 */}
                    <td className="border border-gray-200 px-4 py-2 text-gray-700 font-medium">
                      {DAY_LABELS_SHORT[dayType]}
                    </td>

                    {/* 각 시즌별 요금 - 시즌별 배경색 추가 */}
                    {seasons.map((season) => {
                      const roomPrice = season.roomPrices.find(
                        (rp) => rp.roomId === room.id && rp.channel === channel
                      );

                      const seasonBgColor = getSeasonColor(season.id, season.isDefault);

                      if (!roomPrice) {
                        return (
                          <Fragment key={season.id}>
                            <td className={`border border-gray-200 px-2 py-2 text-center text-gray-400 ${seasonBgColor}`} colSpan={4}>
                              -
                            </td>
                          </Fragment>
                        );
                      }

                      const price = roomPrice.dayPrices[dayType];
                      const extraPrices = roomPrice.extraPersonPrices[dayType];

                      return (
                        <Fragment key={season.id}>
                          <td className={`border border-gray-200 px-3 py-2 text-right font-semibold text-gray-900 ${seasonBgColor}`}>
                            {formatPrice(price)}
                          </td>
                          <td className={`border border-gray-200 px-3 py-2 text-right text-gray-600 ${seasonBgColor}`}>
                            {formatPrice(extraPrices.adult)}
                          </td>
                          <td className={`border border-gray-200 px-3 py-2 text-right text-gray-600 ${seasonBgColor}`}>
                            {formatPrice(extraPrices.child)}
                          </td>
                          <td className={`border border-gray-200 px-3 py-2 text-right text-gray-600 ${seasonBgColor}`}>
                            {formatPrice(extraPrices.infant)}
                          </td>
                        </Fragment>
                      );
                    })}
                  </tr>
                ))}
              </Fragment>
            ));
          })}
        </tbody>
      </table>
    </div>
  );

  // 전체화면 모드
  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-white overflow-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 shadow-sm z-10">
          <div className="max-w-full px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-gray-900">💰 대표 객실 요금 비교</h2>
            </div>
            <Button
              variant="outline"
              size="md"
              onClick={() => setIsFullscreen(false)}
              className="flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              닫기
            </Button>
          </div>
        </div>
        <div className="p-6">
          {renderTableContent()}
        </div>
      </div>
    );
  }

  // 일반 모드
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>💰 대표 객실 요금 비교</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFullscreen(true)}
            className="flex items-center gap-2"
          >
            <Maximize2 className="w-4 h-4" />
            전체화면
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {renderTableContent()}
      </CardContent>
    </Card>
  );
}
