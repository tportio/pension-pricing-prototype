import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { QuickPresetCard } from '../components/pricing/QuickPresetCard';
import { PriceChangeModal } from '../components/modals/PriceChangeModal';
import { usePricing } from '../contexts/PricingContext';
import { QUICK_PRESETS } from '../constants';
import { Trash2, AlertTriangle, Link2, Zap, Home, Plus } from 'lucide-react';
import type { QuickPreset } from '../types';

type SettingId = 'channel-link' | 'manual-reset' | 'quick-templates' | 'room-groups';

interface SettingItem {
  id: SettingId;
  label: string;
  icon: React.ReactNode;
  description: string;
  badge?: string;
}

const SETTINGS_MENU: SettingItem[] = [
  {
    id: 'channel-link',
    label: '채널별 요금 연동',
    icon: <Link2 className="w-5 h-5" />,
    description: '실시간예약창과 온라인판매대행 채널의 요금을 통합 관리하거나 별도로 설정',
  },
  {
    id: 'manual-reset',
    label: '수기 변경 요금 초기화',
    icon: <Trash2 className="w-5 h-5" />,
    description: '빠른 변경이나 개별 날짜 수정으로 설정한 모든 수기 요금 초기화',
  },
  {
    id: 'quick-templates',
    label: '빠른 설정 템플릿',
    icon: <Zap className="w-5 h-5" />,
    description: '자주 사용하는 기간이나 특별한 날짜의 요금을 빠르게 설정',
  },
  {
    id: 'room-groups',
    label: '객실 그룹 설정',
    icon: <Home className="w-5 h-5" />,
    description: '객실을 그룹으로 묶어 일괄 관리',
    badge: 'TBD',
  },
];

export function OtherSettings() {
  const { state, dispatch } = usePricing();
  const [selectedSetting, setSelectedSetting] = useState<SettingId>('channel-link');
  const [selectedPreset, setSelectedPreset] = useState<QuickPreset | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 채널 간 요금 연동 설정
  type PriceLinkMode = 'unified' | 'separate';
  const [priceLinkMode, setPriceLinkMode] = useState<PriceLinkMode>('unified');
  const [onlineDifferencePercent, setOnlineDifferencePercent] = useState<number>(-10); // 온라인채널 가격 차이 (%)
  const [onlineDifferenceType, setOnlineDifferenceType] = useState<'discount' | 'markup'>('discount');

  // 사용자 정의 템플릿 관리
  const [customPresets, setCustomPresets] = useState<QuickPreset[]>([]);
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    icon: '⭐',
    description: '',
    dateRange: {
      start: '',
      end: '',
    },
  });


  const handlePresetClick = (preset: QuickPreset) => {
    setSelectedPreset(preset);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPreset(null);
  };

  // 템플릿 생성
  const handleCreateTemplate = () => {
    if (!newTemplate.name || !newTemplate.dateRange.start || !newTemplate.dateRange.end) {
      alert('템플릿 이름과 날짜 범위를 모두 입력해주세요.');
      return;
    }

    const template: QuickPreset = {
      id: `custom-${Date.now()}`,
      name: newTemplate.name,
      type: 'custom',
      icon: newTemplate.icon,
      description: newTemplate.description,
      dateRange: {
        start: newTemplate.dateRange.start,
        end: newTemplate.dateRange.end,
      },
      isCustom: true,
      createdAt: new Date().toISOString(),
    };

    setCustomPresets([...customPresets, template]);
    setIsCreatingTemplate(false);
    setNewTemplate({
      name: '',
      icon: '⭐',
      description: '',
      dateRange: { start: '', end: '' },
    });
  };

  // 템플릿 삭제
  const handleDeleteTemplate = (presetId: string) => {
    if (confirm('이 템플릿을 삭제하시겠습니까?')) {
      setCustomPresets(customPresets.filter((p) => p.id !== presetId));
    }
  };

  // 템플릿 생성 취소
  const handleCancelCreate = () => {
    setIsCreatingTemplate(false);
    setNewTemplate({
      name: '',
      icon: '⭐',
      description: '',
      dateRange: { start: '', end: '' },
    });
  };

  const handleClearManualPrices = () => {
    if (state.manualPrices.length === 0) {
      alert('초기화할 수기 변경 요금이 없습니다.');
      return;
    }

    const confirmed = confirm(
      `총 ${state.manualPrices.length}개의 수기 변경 요금을 모두 초기화하시겠습니까?\n\n` +
      '초기화 후에는 기본 요금 및 시즌 요금으로 돌아갑니다.\n' +
      '이 작업은 되돌릴 수 없습니다.'
    );

    if (confirmed) {
      dispatch({ type: 'CLEAR_ALL_MANUAL_PRICES' });
      alert('모든 수기 변경 요금이 초기화되었습니다.');
    }
  };

  // 선택된 설정의 콘텐츠 렌더링
  const renderSettingContent = () => {
    switch (selectedSetting) {
      case 'channel-link':
        return renderChannelLinkSettings();
      case 'manual-reset':
        return renderManualResetSettings();
      case 'quick-templates':
        return renderQuickTemplatesSettings();
      case 'room-groups':
        return renderRoomGroupsSettings();
      default:
        return null;
    }
  };

  // 채널별 요금 연동 설정
  const renderChannelLinkSettings = () => (
    <Card>
      <CardHeader>
        <CardTitle>🔗 채널별 요금 연동 설정</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-sm text-gray-600 mb-4">
            실시간예약창과 온라인판매대행 채널의 요금을 통합 관리하거나 별도로 설정할 수 있습니다.
          </div>

          {/* 연동 모드 선택 */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setPriceLinkMode('unified')}
              className={`p-4 border-2 rounded-lg transition-all ${
                priceLinkMode === 'unified'
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-300 hover:border-gray-400 bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="text-base font-semibold text-gray-900">🔗 통합 관리</div>
                {priceLinkMode === 'unified' && (
                  <Badge variant="primary" className="text-xs">선택됨</Badge>
                )}
              </div>
              <div className="text-xs text-gray-600 text-left">
                두 채널의 요금을 동일하게 설정합니다.
                <br />
                한 번만 입력하면 자동으로 동기화됩니다.
              </div>
            </button>

            <button
              onClick={() => setPriceLinkMode('separate')}
              className={`p-4 border-2 rounded-lg transition-all ${
                priceLinkMode === 'separate'
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-300 hover:border-gray-400 bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="text-base font-semibold text-gray-900">⚡ 개별 설정</div>
                {priceLinkMode === 'separate' && (
                  <Badge variant="primary" className="text-xs">선택됨</Badge>
                )}
              </div>
              <div className="text-xs text-gray-600 text-left">
                두 채널의 요금을 다르게 설정합니다.
                <br />
                각 채널마다 별도로 요금을 입력해야 합니다.
              </div>
            </button>
          </div>

          {/* 통합 관리 모드일 때 옵션 */}
          {priceLinkMode === 'unified' && (
            <div className="bg-primary-50 border-2 border-primary-200 rounded-lg p-4 space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="font-semibold text-gray-900">통합 관리 설정</div>
                <Badge variant="primary" className="text-xs">활성화</Badge>
              </div>

              <div className="text-sm text-gray-700 mb-3">
                실시간예약창 요금을 기준으로 온라인판매대행 채널 요금을 자동 계산합니다.
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    온라인 채널 가격 차이
                  </label>
                  <select
                    value={onlineDifferenceType}
                    onChange={(e) => setOnlineDifferenceType(e.target.value as 'discount' | 'markup')}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white"
                  >
                    <option value="discount">할인 (더 저렴하게)</option>
                    <option value="markup">마크업 (더 비싸게)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    차이 비율 (%)
                  </label>
                  <input
                    type="number"
                    value={Math.abs(onlineDifferencePercent)}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      setOnlineDifferencePercent(onlineDifferenceType === 'discount' ? -value : value);
                    }}
                    min={0}
                    max={50}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="bg-white border border-primary-300 rounded p-3 mt-3">
                <div className="text-xs font-medium text-primary-900 mb-1">
                  💡 계산 예시
                </div>
                <div className="text-xs text-gray-700">
                  🏠 실시간예약창: 100,000원
                  <br />
                  🌐 온라인판매대행: {' '}
                  {onlineDifferenceType === 'discount'
                    ? `${(100000 * (1 + onlineDifferencePercent / 100)).toLocaleString()}원 (${Math.abs(
                        onlineDifferencePercent
                      )}% 할인)`
                    : `${(100000 * (1 + onlineDifferencePercent / 100)).toLocaleString()}원 (${
                        onlineDifferencePercent
                      }% 마크업)`}
                </div>
              </div>
            </div>
          )}

          {/* 개별 설정 모드일 때 안내 */}
          {priceLinkMode === 'separate' && (
            <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="font-semibold text-gray-900">개별 설정 모드</div>
                <Badge variant="default" className="text-xs">활성화</Badge>
              </div>
              <div className="text-sm text-gray-700">
                시즌 요금 설정 시 각 채널별로 별도의 요금을 입력해야 합니다.
                <br />
                🏠 <strong>실시간예약창</strong>과 🌐 <strong>온라인판매대행</strong> 채널 요금을 각각 설정할 수 있습니다.
              </div>
            </div>
          )}

          <div className="bg-info-50 border-l-4 border-info-500 p-3 rounded-r">
            <div className="text-sm text-info-900 font-medium mb-1">
              📌 안내사항
            </div>
            <div className="text-xs text-info-700 space-y-1">
              <div>• <strong>통합 관리</strong>: 요금을 한 번만 입력하면 자동으로 양쪽 채널에 적용됩니다.</div>
              <div>• <strong>개별 설정</strong>: 각 채널마다 다른 요금을 설정하고 싶을 때 사용합니다.</div>
              <div>• 온라인판매대행만 사용하거나 실시간예약창만 사용하는 경우, 이 설정은 불필요합니다.</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // 수기 변경 요금 초기화 설정
  const renderManualResetSettings = () => (
    <Card>
      <CardHeader>
        <CardTitle>🗑️ 수기 변경 요금 전체 초기화</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            빠른 변경이나 개별 날짜 수정으로 설정한 모든 수기 요금을 초기화합니다.
            <br />
            초기화 후에는 기본 요금 및 시즌 요금으로 자동 복원됩니다.
          </div>

          <div className="bg-warning-50 border-l-4 border-warning-500 p-4 rounded-r">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-warning-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm text-warning-900 font-medium mb-1">
                  ⚠️ 주의사항
                </div>
                <div className="text-xs text-warning-700 space-y-1">
                  <div>• 이 작업은 되돌릴 수 없습니다.</div>
                  <div>• 모든 수기 변경 요금이 삭제됩니다.</div>
                  <div>• 기본 요금과 시즌 요금은 영향을 받지 않습니다.</div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div>
              <div className="font-medium text-gray-900">
                현재 수기 변경 요금: {state.manualPrices.length}개
              </div>
              <div className="text-xs text-gray-600 mt-1">
                {state.manualPrices.length > 0
                  ? '초기화하려면 우측 버튼을 클릭하세요.'
                  : '수기 변경 요금이 없습니다.'}
              </div>
            </div>
            <Button
              variant="danger"
              size="md"
              onClick={handleClearManualPrices}
              disabled={state.manualPrices.length === 0}
              className="flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              전체 초기화
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // 빠른 설정 템플릿
  const renderQuickTemplatesSettings = () => {
    const allPresets = [...QUICK_PRESETS, ...customPresets];

    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>⚡ 빠른 설정 템플릿</CardTitle>
            {!isCreatingTemplate && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsCreatingTemplate(true)}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                새 템플릿 만들기
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 text-sm text-gray-600">
            자주 사용하는 기간이나 특별한 날짜의 요금을 빠르게 설정할 수 있습니다.
          </div>

          {/* 템플릿 생성 폼 */}
          {isCreatingTemplate && (
            <div className="mb-6 p-6 bg-primary-50 border-2 border-primary-200 rounded-xl">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">새 템플릿 만들기</h4>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      템플릿 이름 *
                    </label>
                    <input
                      type="text"
                      value={newTemplate.name}
                      onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                      placeholder="예: 여름 방학 기간"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      아이콘
                    </label>
                    <input
                      type="text"
                      value={newTemplate.icon}
                      onChange={(e) => setNewTemplate({ ...newTemplate, icon: e.target.value })}
                      placeholder="⭐"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-center text-2xl"
                      maxLength={2}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    설명
                  </label>
                  <input
                    type="text"
                    value={newTemplate.description}
                    onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                    placeholder="예: 여름 방학 기간 특별 요금"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      시작 날짜 *
                    </label>
                    <input
                      type="date"
                      value={newTemplate.dateRange.start}
                      onChange={(e) =>
                        setNewTemplate({
                          ...newTemplate,
                          dateRange: { ...newTemplate.dateRange, start: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      종료 날짜 *
                    </label>
                    <input
                      type="date"
                      value={newTemplate.dateRange.end}
                      onChange={(e) =>
                        setNewTemplate({
                          ...newTemplate,
                          dateRange: { ...newTemplate.dateRange, end: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="primary" size="md" onClick={handleCreateTemplate} className="flex-1">
                    템플릿 생성
                  </Button>
                  <Button variant="outline" size="md" onClick={handleCancelCreate} className="flex-1">
                    취소
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* 템플릿 목록 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allPresets.map((preset) => (
              <QuickPresetCard
                key={preset.id}
                preset={preset}
                onClick={() => handlePresetClick(preset)}
                onDelete={preset.isCustom ? () => handleDeleteTemplate(preset.id) : undefined}
              />
            ))}
          </div>

          {customPresets.length === 0 && !isCreatingTemplate && (
            <div className="mt-6 text-center py-8 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg">
              <div className="text-4xl mb-3">📝</div>
              <div className="text-sm font-medium text-gray-900 mb-1">
                아직 만든 템플릿이 없습니다
              </div>
              <div className="text-xs text-gray-600">
                "새 템플릿 만들기" 버튼을 눌러 나만의 템플릿을 만들어보세요.
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  // 객실 그룹 설정
  const renderRoomGroupsSettings = () => (
    <Card>
      <CardHeader>
        <CardTitle>🏘️ 객실 그룹 설정</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12 text-gray-500">
          <div className="text-5xl mb-4">🔨</div>
          <div className="font-semibold text-lg mb-2">준비 중인 기능입니다</div>
          <div className="text-sm">
            객실을 그룹으로 묶어 일괄 관리할 수 있는 기능이 추가될 예정입니다.
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div className="bg-white border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">⚙️ 기타 설정</h1>
        <p className="text-sm text-gray-600 mt-1">
          추가적인 요금 설정 및 시스템 관리 기능을 제공합니다.
        </p>
      </div>

      {/* 좌우 분할 레이아웃 */}
      <div className="flex gap-6">
        {/* 왼쪽: 설정 메뉴 */}
        <aside className="w-80 flex-shrink-0">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="text-base">설정 목록</CardTitle>
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
                        <div className="flex items-center gap-2 mb-0.5">
                          <div
                            className={`font-medium text-sm ${
                              selectedSetting === setting.id ? 'text-primary-900' : 'text-gray-900'
                            }`}
                          >
                            {setting.label}
                          </div>
                          {setting.badge && (
                            <Badge variant="default" className="text-xs">
                              {setting.badge}
                            </Badge>
                          )}
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

      {/* 가격 변경 모달 */}
      <PriceChangeModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        preset={selectedPreset}
      />
    </div>
  );
}
