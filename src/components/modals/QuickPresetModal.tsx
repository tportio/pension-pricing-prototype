import { useState } from 'react';
import { Modal } from './Modal';
import { QuickPresetCard } from '../pricing/QuickPresetCard';
import { PriceChangeModal } from './PriceChangeModal';
import { QUICK_PRESETS } from '../../constants';
import type { QuickPreset } from '../../types';

interface QuickPresetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QuickPresetModal({ isOpen, onClose }: QuickPresetModalProps) {
  const [selectedPreset, setSelectedPreset] = useState<QuickPreset | null>(null);
  const [isPriceChangeModalOpen, setIsPriceChangeModalOpen] = useState(false);

  const handlePresetClick = (preset: QuickPreset) => {
    setSelectedPreset(preset);
    setIsPriceChangeModalOpen(true);
  };

  const handlePriceChangeModalClose = () => {
    setIsPriceChangeModalOpen(false);
    setSelectedPreset(null);
  };

  const handleApplyComplete = () => {
    // 적용 완료 후 모든 모달 닫기
    setIsPriceChangeModalOpen(false);
    setSelectedPreset(null);
    onClose();
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="large">
        <div className="p-6">
          {/* 헤더 */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">⚡ 빠른 설정</h2>
            <p className="text-gray-600">
              자주 사용하는 날짜나 기간에 대한 요금을 빠르게 설정할 수 있습니다.
            </p>
          </div>

          {/* 프리셋 그리드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {QUICK_PRESETS.map((preset) => (
              <QuickPresetCard
                key={preset.id}
                preset={preset}
                onClick={() => handlePresetClick(preset)}
              />
            ))}
          </div>

          {/* 안내 문구 */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <span className="text-blue-600 text-lg flex-shrink-0">💡</span>
              <div className="text-sm text-gray-700">
                <div className="font-semibold text-gray-900 mb-1">프리셋 사용 방법</div>
                <ul className="space-y-1 list-disc list-inside text-gray-600">
                  <li>원하는 프리셋을 선택하세요</li>
                  <li>요금 변경 방식을 선택하고 적용합니다</li>
                  <li>적용된 요금은 수동 설정으로 저장되어 최우선 적용됩니다</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* 요금 변경 모달 */}
      {selectedPreset && (
        <PriceChangeModal
          isOpen={isPriceChangeModalOpen}
          onClose={handlePriceChangeModalClose}
          preset={selectedPreset}
          onApplyComplete={handleApplyComplete}
        />
      )}
    </>
  );
}
