import { useState } from 'react';
import { PricingProvider } from './contexts/PricingContext';
import { Layout } from './components/layout/Layout';
import { TabNavigation } from './components/layout/TabNavigation';
import type { TabId } from './components/layout/TabNavigation';
import { PricingOverview } from './pages/PricingOverview';
import { BaseSettings } from './pages/BaseSettings';
import { PromotionSettings } from './pages/PromotionSettings';
import { OtherSettings } from './pages/OtherSettings';
import { PricingGuide } from './pages/PricingGuide';

function App() {
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <PricingOverview />;
      case 'base':
        return <BaseSettings />;
      case 'promotion':
        return <PromotionSettings />;
      case 'other':
        return <OtherSettings />;
      case 'guide':
        return <PricingGuide />;
      default:
        return null;
    }
  };

  return (
    <PricingProvider>
      <Layout>
        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="mt-6">{renderContent()}</div>
      </Layout>
    </PricingProvider>
  );
}

export default App;
