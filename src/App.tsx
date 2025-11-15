import React, { useState } from 'react';
import { Box } from '@mui/material';
import { TopBar } from './components/TopBar';
import { WorkspacePage } from './pages/WorkspacePage';
import { RulesPage } from './pages/RulesPage';

export type TabType = 'workspace' | 'rules';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('workspace');

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'var(--bg-base)' }}>
      <TopBar activeTab={activeTab} onTabChange={setActiveTab} />
      {activeTab === 'workspace' ? <WorkspacePage /> : <RulesPage />}
    </Box>
  );
};

export default App;
