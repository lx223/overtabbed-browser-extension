import React from 'react';
import { Box, Typography, ToggleButtonGroup, ToggleButton, Tabs, Tab } from '@mui/material';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import SettingsBrightnessIcon from '@mui/icons-material/SettingsBrightness';
import ViewListIcon from '@mui/icons-material/ViewList';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import { useTheme, ThemeMode } from '@/contexts/ThemeContext';
import type { TabType } from '@/App';

interface TopBarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const TopBar: React.FC<TopBarProps> = ({ activeTab, onTabChange }) => {
  const { mode, setMode } = useTheme();

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: { xs: 2, sm: 3, md: 4 },
        py: 1,
        borderBottom: '1px solid var(--border-subtle)',
        backgroundColor: 'var(--bg-elevated)',
        backdropFilter: 'blur(8px)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            fontSize: '1rem',
            letterSpacing: '-0.02em',
            color: 'var(--text-primary)',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <Box
            component="span"
            sx={{
              width: 20,
              height: 20,
              borderRadius: 1,
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              display: 'inline-block',
            }}
          />
          Overtabbed
        </Typography>

        <Tabs
          value={activeTab}
          onChange={(_, value) => onTabChange(value)}
          sx={{
            minHeight: 36,
            '& .MuiTabs-indicator': {
              backgroundColor: 'var(--accent-primary)',
              height: 2,
            },
            '& .MuiTab-root': {
              minHeight: 36,
              py: 0.5,
              px: 1.5,
              textTransform: 'none',
              fontSize: '0.8125rem',
              fontWeight: 500,
              color: 'var(--text-tertiary)',
              transition: 'color 0.15s ease',
              '&:hover': {
                color: 'var(--text-secondary)',
              },
              '&.Mui-selected': {
                color: 'var(--text-primary)',
              },
            },
          }}
        >
          <Tab
            value="workspace"
            label="Workspace"
            icon={<ViewListIcon sx={{ fontSize: 16 }} />}
            iconPosition="start"
            sx={{ gap: 0.5 }}
          />
          <Tab
            value="rules"
            label="Rules"
            icon={<AutoFixHighIcon sx={{ fontSize: 16 }} />}
            iconPosition="start"
            sx={{ gap: 0.5 }}
          />
        </Tabs>
      </Box>

      <ToggleButtonGroup
        value={mode}
        exclusive
        onChange={(_, newMode) => newMode && setMode(newMode as ThemeMode)}
        size="small"
        sx={{
          backgroundColor: 'var(--bg-muted)',
          borderRadius: 2,
          padding: 0.25,
          '& .MuiToggleButtonGroup-grouped': {
            border: 'none',
            borderRadius: '6px !important',
            px: 1.25,
            py: 0.5,
            color: 'var(--text-tertiary)',
            transition: 'all 0.15s ease',
            '&:hover': {
              backgroundColor: 'var(--bg-hover)',
            },
            '&.Mui-selected': {
              backgroundColor: 'var(--bg-surface)',
              color: 'var(--text-primary)',
              boxShadow: 'var(--shadow-sm)',
              '&:hover': {
                backgroundColor: 'var(--bg-surface)',
              },
            },
          },
        }}
      >
        <ToggleButton value="light" aria-label="light mode">
          <LightModeIcon sx={{ fontSize: 16 }} />
        </ToggleButton>
        <ToggleButton value="auto" aria-label="auto mode">
          <SettingsBrightnessIcon sx={{ fontSize: 16 }} />
        </ToggleButton>
        <ToggleButton value="dark" aria-label="dark mode">
          <DarkModeIcon sx={{ fontSize: 16 }} />
        </ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
};
