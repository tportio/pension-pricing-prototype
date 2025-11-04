import { useState, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { SeasonCard } from '../components/season/SeasonCard';
import { SeasonPriceEditModal } from '../components/modals/SeasonPriceEditModal';
import { SeasonTimeline } from '../components/pricing/SeasonTimeline';
import { PricingTable } from '../components/pricing/PricingTable';
import { SeasonExpirationAlert } from '../components/season/SeasonExpirationAlert';
import { Plus, Calendar, Sparkles, Layers } from 'lucide-react';
import { usePricing } from '../contexts/PricingContext';
import type { Season, Channel } from '../types';

type SettingId = 'current-rates' | 'base-rate' | 'season-rates';

interface SettingItem {
  id: SettingId;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const SETTINGS_MENU: SettingItem[] = [
  {
    id: 'current-rates',
    label: '현재 설정 요금',
    icon: <Calendar className="w-5 h-5" />,
    description: '연간 타임라인 및 요금 개요',
  },
  {
    id: 'base-rate',
    label: '기본 요금 (비수기)',
    icon: <Sparkles className="w-5 h-5" />,
    description: '기본 비수기 요금 설정',
  },
  {
    id: 'season-rates',
    label: '시즌 요금',
    icon: <Layers className="w-5 h-5" />,
    description: '시즌별 요금 관리',
  },
];

export function BaseSettings() {
  const { state, dispatch } = usePricing();
  const [selectedSetting, setSelectedSetting] = useState<SettingId>('current-rates');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState<Season | undefined>();
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'copy'>('add');
  const [selectedChannels, setSelectedChannels] = useState<Channel[]>(['reservation', 'online']);
  const seasonCardsRef = useRef<Record<string, HTMLDivElement | null>>({});

  const handleAddSeason = () => {
    setSelectedSeason(undefined);
    setModalMode('add');
    setIsModalOpen(true);
  };

  const handleEditSeason = (season: Season) => {
    setSelectedSeason(season);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleCopySeason = (season: Season) => {
    setSelectedSeason(season);
    setModalMode('copy');
    setIsModalOpen(true);
  };

  const handleDeleteSeason = (seasonId: string) => {
    if (confirm('정말 이 시즌을 삭제하시겠습니까?')) {
      dispatch({ type: 'DELETE_SEASON', payload: seasonId });
    }
  };

  const handleSeasonClick = (seasonId: string) => {
    const element = seasonCardsRef.current[seasonId];
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // 강조 효과를 위한 간단한 애니메이션
      element.style.transform = 'scale(1.02)';
      element.style.transition = 'transform 0.2s';
      setTimeout(() => {
        element.style.transform = 'scale(1)';
      }, 300);
    }
  };

  const handleChannelToggle = (channel: Channel) => {
    if (selectedChannels.includes(channel)) {
      if (selectedChannels.length > 1) {
        setSelectedChannels(selectedChannels.filter((c) => c !== channel));
      }
    } else {
      setSelectedChannels([...selectedChannels, channel]);
    }
  };

  const defaultSeason = state.seasons.find(s => s.isDefault);
  const otherSeasons = state.seasons
    .filter(s => !s.isDefault)
    .sort((a, b) => a.startDate.localeCompare(b.startDate));

  // 선택된 설정의 콘텐츠 렌더링
  const renderSettingContent = () => {
    switch (selectedSetting) {
      case 'current-rates':
        return renderCurrentRatesSettings();
      case 'base-rate':
        return renderBaseRateSettings();
      case 'season-rates':
        return renderSeasonRatesSettings();
      default:
        return null;
    }
  };

  // 현재 설정 요금 (타임라인 + 요금 개요)
  const renderCurrentRatesSettings = () => (
    <>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>📅 연간 시즌 타임라인</CardTitle>
        </CardHeader>
        <CardContent>
          <SeasonTimeline onSeasonClick={handleSeasonClick} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>📊 현재 설정 요금</CardTitle>
        </CardHeader>
        <CardContent>
          {/* 채널 필터 */}
          <div className="flex items-center gap-4 mb-6">
            <div className="font-semibold text-gray-900">💰 표시할 채널:</div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedChannels.includes('reservation')}
                onChange={() => handleChannelToggle('reservation')}
                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
              />
              <span className="text-gray-700">🏠 예약창 요금</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedChannels.includes('online')}
                onChange={() => handleChannelToggle('online')}
                className="w-4 h-4 text-success-600 rounded focus:ring-success-500"
              />
              <span className="text-gray-700">🌐 온라인 요금</span>
            </label>
          </div>

          {/* 객실 요금 비교 테이블 */}
          <PricingTable selectedChannels={selectedChannels} />

          {/* 통계 요약 */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-success-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">평일 최저가</div>
              <div className="text-xl font-bold text-success-700">🏠 100K / 🌐 90K</div>
              <div className="text-xs text-gray-500 mt-1">101호 스탠다드</div>
            </div>
            <div className="bg-danger-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">평일 최고가</div>
              <div className="text-xl font-bold text-danger-700">🏠 800K / 🌐 720K</div>
              <div className="text-xs text-gray-500 mt-1">210호 펜트하우스</div>
            </div>
            <div className="bg-primary-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">토요일 최저가</div>
              <div className="text-xl font-bold text-primary-700">🏠 350K / 🌐 315K</div>
              <div className="text-xs text-gray-500 mt-1">101호 스탠다드</div>
            </div>
            <div className="bg-warning-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">토요일 최고가</div>
              <div className="text-xl font-bold text-warning-700">🏠 2.8M / 🌐 2.5M</div>
              <div className="text-xs text-gray-500 mt-1">210호 펜트하우스</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );

  // 기본 요금 (비수기)
  const renderBaseRateSettings = () => (
    <Card>
      <CardHeader>
        <CardTitle>📌 기본 요금 (비수기)</CardTitle>
      </CardHeader>
      <CardContent>
        {defaultSeason && (
          <>
            <SeasonCard
              season={defaultSeason}
              onEdit={() => handleEditSeason(defaultSeason)}
            />
            <div className="mt-4 text-sm text-gray-600">
              💡 기본 요금은 다른 시즌이 적용되지 않는 모든 날짜에 자동으로 적용됩니다.
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );

  // 시즌 요금
  const renderSeasonRatesSettings = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>🎯 시즌별 요금 관리</CardTitle>
          <Button variant="primary" size="sm" onClick={handleAddSeason}>
            <Plus className="w-4 h-4 mr-1" />
            새 시즌 추가
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {otherSeasons.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">🌸</div>
            <div className="text-gray-600 mb-2">아직 추가된 시즌이 없습니다.</div>
            <div className="text-sm text-gray-500 mb-4">
              새 시즌을 추가하여 특정 기간의 요금을 관리하세요.
            </div>
            <Button variant="primary" onClick={handleAddSeason}>
              <Plus className="w-4 h-4 mr-1" />
              첫 시즌 추가하기
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {otherSeasons.map((season) => (
              <div
                key={season.id}
                ref={(el) => {
                  if (el) seasonCardsRef.current[season.id] = el;
                }}
              >
                <SeasonCard
                  season={season}
                  onEdit={() => handleEditSeason(season)}
                  onCopy={() => handleCopySeason(season)}
                  onDelete={() => handleDeleteSeason(season.id)}
                />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div className="bg-white border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">🌸 기본 요금 설정</h1>
        <p className="text-sm text-gray-600 mt-1">
          기본 요금 및 시즌별 요금을 관리하세요.
        </p>
      </div>

      {/* 시즌 종료 알림 */}
      <SeasonExpirationAlert daysBeforeEnd={30} />

      {/* 좌우 분할 레이아웃 */}
      <div className="flex gap-6">
        {/* 왼쪽: 설정 메뉴 */}
        <aside className="w-80 flex-shrink-0">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="text-base">설정 메뉴</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <nav className="space-y-1">
                {SETTINGS_MENU.map((setting) => (
                  <button
                    key={setting.id}
                    onClick={() => setSelectedSetting(setting.id)}
                    className={`w-full text-left px-4 py-3 transition-all border-l-4 ${
                      selectedSetting === setting.id
                        ? 'bg-primary-50 border-primary-500 text-primary-900'
                        : 'bg-white border-transparent text-gray-700 hover:bg-gray-50 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`mt-0.5 ${
                          selectedSetting === setting.id ? 'text-primary-600' : 'text-gray-500'
                        }`}
                      >
                        {setting.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div
                          className={`font-medium text-sm mb-0.5 ${
                            selectedSetting === setting.id ? 'text-primary-900' : 'text-gray-900'
                          }`}
                        >
                          {setting.label}
                        </div>
                        <div className="text-xs text-gray-600 line-clamp-2">
                          {setting.description}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </nav>
            </CardContent>
          </Card>
        </aside>

        {/* 오른쪽: 설정 상세 */}
        <div className="flex-1 min-w-0">{renderSettingContent()}</div>
      </div>

      {/* 시즌 추가/수정 모달 */}
      <SeasonPriceEditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        season={selectedSeason}
        mode={modalMode}
      />
    </div>
  );
}
