import { useState } from 'react';
import { Calendar, Zap } from 'lucide-react';
import { Button } from '../common/Button';
import { QuickPresetModal } from '../modals/QuickPresetModal';
import { QuickChangeDropdown } from '../pricing/QuickChangeDropdown';

export function Header() {
  const [isPresetModalOpen, setIsPresetModalOpen] = useState(false);

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-[1800px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* 왼쪽: 로고 + 타이틀 */}
            <div className="flex items-center gap-3">
              <Calendar className="w-6 h-6 text-primary-600" />
              <h1 className="text-2xl font-semibold text-gray-900">
                펜션플러스 다중 객실 요금 설정
              </h1>
            </div>

            {/* 오른쪽: 빠른 변경 버튼 */}
            <div className="flex items-center gap-3">
              <QuickChangeDropdown />
              <Button
                variant="primary"
                size="md"
                onClick={() => setIsPresetModalOpen(true)}
                className="flex items-center gap-2"
              >
                <Zap className="w-4 h-4" />
                <span className="hidden sm:inline">빠른 변경 (모달)</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* 빠른 변경 모달 */}
      <QuickPresetModal
        isOpen={isPresetModalOpen}
        onClose={() => setIsPresetModalOpen(false)}
      />
    </>
  );
}
