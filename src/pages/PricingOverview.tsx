import { useState } from 'react';
import { PricingCalendar } from '../components/calendar/PricingCalendar';
import { RoomDateGrid } from '../components/calendar/RoomDateGrid';
import { Card, CardHeader, CardTitle, CardContent } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { DailyPriceEditModal } from '../components/modals/DailyPriceEditModal';
import { usePricing } from '../contexts/PricingContext';
import { cn, formatKoreanDate, formatPrice } from '../utils';
import { CHANNEL_LABELS } from '../constants';
import { Calendar, Globe, ChevronDown, ChevronUp, Edit } from 'lucide-react';
import type { Channel } from '../types';

type ViewMode = 'default' | 'calendar' | 'table';

export function PricingOverview() {
  const { state, getDailyPriceInfo } = usePricing();
  const [viewMode, setViewMode] = useState<ViewMode>('default');
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [selectedChannels, setSelectedChannels] = useState<Channel[]>(['reservation', 'online']);
  const [selectedRoomIds, setSelectedRoomIds] = useState<string[]>(state.rooms.map(r => r.id));
  const [isPriceEditModalOpen, setIsPriceEditModalOpen] = useState(false);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  const handleDateClickWithModal = (date: Date) => {
    setSelectedDate(date);
    setIsPriceEditModalOpen(true);
  };

  const handleMultiDateSelect = (dates: Date[]) => {
    setSelectedDates(dates);
  };

  const toggleChannel = (channel: Channel) => {
    setSelectedChannels(prev =>
      prev.includes(channel) ? prev.filter(c => c !== channel) : [...prev, channel]
    );
  };

  const toggleRoom = (roomId: string) => {
    setSelectedRoomIds(prev =>
      prev.includes(roomId) ? prev.filter(id => id !== roomId) : [...prev, roomId]
    );
  };

  const toggleAllRooms = (group: 'villa' | 'standard') => {
    const groupRooms = state.rooms.filter(r => r.id.includes(group));
    const allSelected = groupRooms.every(r => selectedRoomIds.includes(r.id));

    if (allSelected) {
      setSelectedRoomIds(prev => prev.filter(id => !groupRooms.some(r => r.id === id)));
    } else {
      setSelectedRoomIds(prev => [...new Set([...prev, ...groupRooms.map(r => r.id)])]);
    }
  };

  // 테이블 뷰용 데이터 생성
  const generateTableData = () => {
    const [year, month] = state.currentMonth.split('-').map(Number);
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const dates: Date[] = [];
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      dates.push(new Date(d));
    }

    return dates;
  };

  const selectedPriceInfo = selectedDate ? getDailyPriceInfo(selectedDate) : null;
  const villaRooms = state.rooms.filter(r => r.id.includes('villa'));
  const standardRooms = state.rooms.filter(r => r.id.includes('standard'));
  const tableData = viewMode === 'table' ? generateTableData() : [];
  const displayRooms = selectedRoomIds.length > 0
    ? state.rooms.filter(r => selectedRoomIds.includes(r.id))
    : state.rooms;

  return (
    <div className="space-y-6">
      {/* 헤더 with 통합된 필터 */}
      <Card>
        <CardContent>
          {/* 1행: 제목 & 뷰 모드 전환 */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">💰 요금 전체보기</h2>

            {/* 뷰 모드 전환 버튼 */}
            <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('default')}
                className={cn(
                  'px-4 py-2 rounded-md text-sm font-medium transition-all',
                  viewMode === 'default'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                )}
              >
                📅 기본 뷰
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={cn(
                  'px-4 py-2 rounded-md text-sm font-medium transition-all',
                  viewMode === 'calendar'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                )}
              >
                📆 캘린더 뷰
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={cn(
                  'px-4 py-2 rounded-md text-sm font-medium transition-all',
                  viewMode === 'table'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                )}
              >
                📊 테이블 뷰
              </button>
            </div>
          </div>

          {/* 2행: 필터 설정 */}
          <div className="space-y-3 pt-3 border-t border-gray-200">
            {/* 채널 필터 */}
            <div className="flex items-center gap-3">
              <div className="text-sm font-medium text-gray-700 min-w-[80px]">💰 채널</div>
              <div className="flex gap-2">
                <label
                  className="flex items-center gap-1.5 px-3 py-1.5 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors text-sm"
                  style={{
                    borderColor: selectedChannels.includes('reservation') ? '#0ea5e9' : '#e5e7eb',
                    backgroundColor: selectedChannels.includes('reservation') ? '#f0f9ff' : 'white',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedChannels.includes('reservation')}
                    onChange={() => toggleChannel('reservation')}
                    className="w-3.5 h-3.5"
                  />
                  <Calendar className="w-3.5 h-3.5" />
                  <span>예약창</span>
                </label>
                <label
                  className="flex items-center gap-1.5 px-3 py-1.5 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors text-sm"
                  style={{
                    borderColor: selectedChannels.includes('online') ? '#0ea5e9' : '#e5e7eb',
                    backgroundColor: selectedChannels.includes('online') ? '#f0f9ff' : 'white',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedChannels.includes('online')}
                    onChange={() => toggleChannel('online')}
                    className="w-3.5 h-3.5"
                  />
                  <Globe className="w-3.5 h-3.5" />
                  <span>온라인</span>
                </label>
              </div>
            </div>

            {/* 객실 필터 - 간결한 버전 */}
            <div className="flex items-start gap-3">
              <div className="text-sm font-medium text-gray-700 min-w-[80px] pt-1.5">🏠 객실</div>
              <div className="flex-1 space-y-2">
                {/* 독채 객실 */}
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={villaRooms.every(r => selectedRoomIds.includes(r.id))}
                      onChange={() => toggleAllRooms('villa')}
                      className="w-3.5 h-3.5"
                    />
                    <span className="text-sm font-medium">🏡 독채 ({villaRooms.length})</span>
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {villaRooms.map(room => (
                      <label
                        key={room.id}
                        className={cn(
                          "flex items-center gap-1 px-2 py-0.5 rounded text-xs cursor-pointer transition-colors",
                          selectedRoomIds.includes(room.id)
                            ? "bg-green-100 text-green-900 border border-green-300"
                            : "bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200"
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={selectedRoomIds.includes(room.id)}
                          onChange={() => toggleRoom(room.id)}
                          className="w-2.5 h-2.5"
                        />
                        <span className="truncate max-w-[60px]">{room.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* 스탠다드 객실 */}
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={standardRooms.every(r => selectedRoomIds.includes(r.id))}
                      onChange={() => toggleAllRooms('standard')}
                      className="w-3.5 h-3.5"
                    />
                    <span className="text-sm font-medium">🏠 스탠다드 ({standardRooms.length})</span>
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {standardRooms.map(room => (
                      <label
                        key={room.id}
                        className={cn(
                          "flex items-center gap-1 px-2 py-0.5 rounded text-xs cursor-pointer transition-colors",
                          selectedRoomIds.includes(room.id)
                            ? "bg-blue-100 text-blue-900 border border-blue-300"
                            : "bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200"
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={selectedRoomIds.includes(room.id)}
                          onChange={() => toggleRoom(room.id)}
                          className="w-2.5 h-2.5"
                        />
                        <span className="truncate max-w-[60px]">{room.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 기본 뷰: 캘린더와 상세 정보를 가로로 배치 */}
      {viewMode === 'default' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 캘린더 */}
          <div>
            <PricingCalendar
              onDateClick={handleDateClick}
              selectedChannels={selectedChannels}
              selectedRoomIds={selectedRoomIds}
            />

            {/* 범례 */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>📋 표시 범례</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="text-xs font-semibold text-gray-600 mb-2">배경색</div>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-white border border-gray-300 rounded"></div>
                        <span className="text-gray-700">기본 요금</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border border-gray-300 rounded" style={{ backgroundColor: '#dbeafe' }}></div>
                        <span className="text-gray-700">시즌별 색상</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-warning-50 border border-warning-200 rounded"></div>
                        <span className="text-gray-700">수동 설정</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-600 mb-2">표시 기호</div>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-warning-700 bg-warning-200 px-1 rounded">수</span>
                        <span className="text-gray-700">수동 설정 포함</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="danger" className="text-xs font-bold">휴</Badge>
                        <span className="text-gray-700">공휴일</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 선택한 날짜 상세 정보 */}
          <div className="lg:sticky lg:top-6 lg:self-start">
            {selectedPriceInfo && selectedDate ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{formatKoreanDate(selectedDate)} 요금 상세</CardTitle>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setIsPriceEditModalOpen(true)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      요금 수정
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* 통계 */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-success-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">최저 가격</div>
                      <div className="text-2xl font-bold text-success-700">
                        {formatPrice(selectedPriceInfo.minPrice)}원
                      </div>
                    </div>
                    <div className="bg-danger-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">최고 가격</div>
                      <div className="text-2xl font-bold text-danger-700">
                        {formatPrice(selectedPriceInfo.maxPrice)}원
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">평균 가격</div>
                      <div className="text-2xl font-bold text-gray-700">
                        {formatPrice(selectedPriceInfo.avgPrice)}원
                      </div>
                    </div>
                  </div>

                  {/* 객실별 요금 테이블 */}
                  <div className="space-y-4">
                    {Object.entries(
                      selectedPriceInfo.roomPrices.reduce((acc, rp) => {
                        if (!acc[rp.roomName]) {
                          acc[rp.roomName] = [];
                        }
                        acc[rp.roomName].push(rp);
                        return acc;
                      }, {} as Record<string, typeof selectedPriceInfo.roomPrices>)
                    ).map(([roomName, roomPrices]) => (
                      <div key={roomName} className="border border-gray-200 rounded-lg overflow-hidden">
                        <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-200">
                          <h4 className="font-semibold text-gray-900">{roomName}</h4>
                        </div>
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                              <th className="px-4 py-2 text-left font-medium text-gray-700">채널</th>
                              <th className="px-4 py-2 text-left font-medium text-gray-700">적용 요금</th>
                              <th className="px-4 py-2 text-right font-medium text-gray-700">객실 요금</th>
                              <th className="px-4 py-2 text-right font-medium text-gray-700">성인 추가</th>
                              <th className="px-4 py-2 text-right font-medium text-gray-700">아동 추가</th>
                              <th className="px-4 py-2 text-right font-medium text-gray-700">유아 추가</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {roomPrices.map((rp, index) => (
                              <tr key={index} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-3">
                                  <Badge variant={rp.channel === 'reservation' ? 'info' : 'success'}>
                                    {CHANNEL_LABELS[rp.channel]}
                                  </Badge>
                                </td>
                                <td className="px-4 py-3">
                                  <Badge
                                    variant={
                                      rp.appliedRule === 'manual'
                                        ? 'warning'
                                        : rp.appliedRule === 'season'
                                        ? 'info'
                                        : 'default'
                                    }
                                    className="text-xs"
                                  >
                                    {rp.appliedRule === 'manual'
                                      ? '✏️ 수동'
                                      : rp.appliedRule === 'season'
                                      ? `🎯 ${rp.seasonName}`
                                      : '📌 기본'}
                                  </Badge>
                                </td>
                                <td className="px-4 py-3 text-right font-semibold text-gray-900">
                                  {formatPrice(rp.price)}원
                                </td>
                                <td className="px-4 py-3 text-right text-gray-700">
                                  {formatPrice(rp.extraPersonPrices.adult)}원
                                </td>
                                <td className="px-4 py-3 text-right text-gray-700">
                                  {formatPrice(rp.extraPersonPrices.child)}원
                                </td>
                                <td className="px-4 py-3 text-right text-gray-700">
                                  {formatPrice(rp.extraPersonPrices.infant)}원
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent>
                  <div className="text-center py-12">
                    <div className="text-4xl mb-3">📅</div>
                    <div className="text-gray-600 mb-2">날짜를 선택하세요</div>
                    <div className="text-sm text-gray-500">
                      캘린더에서 날짜를 클릭하면 해당 날짜의 상세 요금 정보를 확인할 수 있습니다.
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* 캘린더 뷰 */}
      {viewMode === 'calendar' && (
        <RoomDateGrid
          selectedChannels={selectedChannels}
          selectedRoomIds={selectedRoomIds.length > 0 ? selectedRoomIds : state.rooms.map(r => r.id)}
          onDateClick={handleDateClickWithModal}
          onMultiDateSelect={handleMultiDateSelect}
        />
      )}

      {/* 테이블 뷰 */}
      {viewMode === 'table' && (
        <Card>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-200 px-3 py-2 text-left font-semibold text-gray-700 sticky left-0 bg-gray-50 z-10">
                      날짜
                    </th>
                    <th className="border border-gray-200 px-3 py-2 text-center font-semibold text-gray-700">
                      요일
                    </th>
                    {displayRooms.map(room => (
                      <th
                        key={room.id}
                        className="border border-gray-200 px-3 py-2 text-center font-semibold text-gray-700"
                      >
                        {room.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((date, index) => {
                    const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];
                    const priceInfo = getDailyPriceInfo(date);

                    return (
                      <tr key={index} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleDateClickWithModal(date)}>
                        <td className="border border-gray-200 px-3 py-2 font-medium sticky left-0 bg-white">
                          {date.getMonth() + 1}/{date.getDate()}
                        </td>
                        <td className={cn(
                          'border border-gray-200 px-3 py-2 text-center',
                          date.getDay() === 0 ? 'text-danger-600 font-semibold' :
                          date.getDay() === 6 ? 'text-primary-600 font-semibold' :
                          'text-gray-700'
                        )}>
                          {dayOfWeek}
                        </td>
                        {displayRooms.map(room => {
                          const roomPrices = priceInfo?.roomPrices.filter(
                            rp => rp.roomId === room.id && selectedChannels.includes(rp.channel)
                          ) || [];

                          return (
                            <td
                              key={room.id}
                              className="border border-gray-200 px-2 py-2 text-center text-xs"
                            >
                              {roomPrices.length > 0 ? (
                                <div className="space-y-0.5">
                                  {roomPrices.map((rp, idx) => (
                                    <div key={idx} className="flex items-center justify-center gap-1.5">
                                      {rp.channel === 'reservation' ? (
                                        <Calendar className="w-3 h-3 text-primary-600" />
                                      ) : (
                                        <Globe className="w-3 h-3 text-success-600" />
                                      )}
                                      <span className="font-semibold">
                                        {formatPrice(rp.price)}
                                      </span>
                                      <Badge
                                        variant={
                                          rp.appliedRule === 'manual' ? 'warning' :
                                          rp.appliedRule === 'season' ? 'info' : 'default'
                                        }
                                        className="text-[9px] px-1 py-0"
                                      >
                                        {rp.appliedRule === 'manual' ? '수' :
                                         rp.appliedRule === 'season' ? '시' : '기'}
                                      </Badge>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Legend for table view */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-4 text-xs">
                {/* 채널 타입 */}
                <div>
                  <div className="font-semibold text-gray-700 mb-2">채널</div>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary-600" />
                      <span className="text-gray-700">예약창 요금</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-success-600" />
                      <span className="text-gray-700">온라인채널 요금</span>
                    </div>
                  </div>
                </div>

                {/* 가격 타입 */}
                <div>
                  <div className="font-semibold text-gray-700 mb-2">요금 타입</div>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="warning" className="text-[10px] px-1.5 py-0.5">수</Badge>
                      <span className="text-gray-700">수동 설정 요금</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="info" className="text-[10px] px-1.5 py-0.5">시</Badge>
                      <span className="text-gray-700">시즌 요금</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="default" className="text-[10px] px-1.5 py-0.5">기</Badge>
                      <span className="text-gray-700">기본 요금</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 요금 수정 모달 */}
      <DailyPriceEditModal
        isOpen={isPriceEditModalOpen}
        onClose={() => setIsPriceEditModalOpen(false)}
        date={selectedDate}
      />
    </div>
  );
}
