import { cn } from '../../utils';

export type TabId = 'overview' | 'base' | 'promotion' | 'other' | 'guide';

interface Tab {
  id: TabId;
  label: string;
  icon: string;
}

const tabs: Tab[] = [
  { id: 'overview', label: '요금 전체보기', icon: '💰' },
  { id: 'base', label: '기본 요금 설정', icon: '🌸' },
  { id: 'promotion', label: '프로모션 설정', icon: '🎁' },
  { id: 'other', label: '기타 설정', icon: '⚙️' },
  { id: 'guide', label: '요금 가이드', icon: '📚' },
];

interface TabNavigationProps {
  activeTab: TabId;
  onTabChange: (tabId: TabId) => void;
}

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-[1800px] mx-auto px-6">
        <div className="flex gap-2 py-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'px-6 py-2.5 rounded-lg font-medium text-sm transition-all',
                activeTab === tab.id
                  ? 'bg-primary-50 text-primary-700 shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
