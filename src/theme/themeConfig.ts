import type { ThemeConfig } from 'antd';

export const darkTheme: ThemeConfig = {
  token: {
    colorPrimary: '#D49A20',
    colorSuccess: '#22C55E',
    colorWarning: '#F59E0B',
    colorError: '#EF4444',
    colorInfo: '#3B82F6',
    colorBgBase: '#030712',
    colorBgContainer: '#1F2937',
    colorBgElevated: '#111827',
    colorTextBase: '#F9FAFB',
    colorTextSecondary: '#D1D5DB',
    colorTextTertiary: '#9CA3AF',
    colorBorder: '#374151',
    colorBorderSecondary: '#4B5563',
    fontFamily: `"Inter", "Microsoft YaHei", "微软雅黑", system-ui, sans-serif`,
    fontSize: 14,
    borderRadius: 8,
    controlHeight: 36,
  },
  components: {
    Button: {
      colorPrimary: '#D49A20',
      colorPrimaryHover: '#BF8718',
      colorPrimaryActive: '#A66A14',
      borderRadius: 8,
    },
    Input: {
      colorBgContainer: '#111827',
      colorBorder: '#374151',
      borderRadius: 8,
    },
    Select: {
      colorBgContainer: '#111827',
      colorBorder: '#374151',
      borderRadius: 8,
      optionSelectedBg: 'rgba(212, 154, 32, 0.15)',
    },
    Menu: {
      colorBgContainer: 'transparent',
      itemSelectedBg: 'rgba(212, 154, 32, 0.15)',
      itemSelectedColor: '#D49A20',
      itemColor: '#D1D5DB',
      itemHoverColor: '#F9FAFB',
      itemHoverBg: '#374151',
    },
    Modal: {
      colorBgElevated: '#111827',
      colorText: '#F9FAFB',
    },
    Tag: { borderRadiusSM: 4 },
    Segmented: {
      colorBgLayout: '#111827',
      borderRadius: 8,
    },
    Slider: {
      trackBg: '#D49A20',
      trackHoverBg: '#BF8718',
      railBg: '#374151',
    },
    Table: {
      colorBgContainer: '#1F2937',
      colorText: '#F9FAFB',
      borderColor: '#374151',
      headerBg: '#111827',
      rowHoverBg: '#374151',
    },
    Card: {
      colorBgContainer: '#1F2937',
    },
  },
};
