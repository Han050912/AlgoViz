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
      colorBgContainer: '#1F2937',
      colorBgElevated: '#1F2937',
      colorText: '#F9FAFB',
      colorBorder: '#374151',
      headerBg: '#1F2937',
      contentBg: '#1F2937',
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

export const lightTheme: ThemeConfig = {
  token: {
    colorPrimary: '#D49A20',
    colorSuccess: '#22C55E',
    colorWarning: '#F59E0B',
    colorError: '#EF4444',
    colorInfo: '#3B82F6',
    colorBgBase: '#F3F4F6',
    colorBgContainer: '#FFFFFF',
    colorBgElevated: '#F9FAFB',
    colorTextBase: '#111827',
    colorTextSecondary: '#374151',
    colorTextTertiary: '#6B7280',
    colorBorder: '#E5E7EB',
    colorBorderSecondary: '#D1D5DB',
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
      colorBgContainer: '#FFFFFF',
      colorBorder: '#E5E7EB',
      borderRadius: 8,
    },
    Select: {
      colorBgContainer: '#FFFFFF',
      colorBorder: '#E5E7EB',
      borderRadius: 8,
      optionSelectedBg: 'rgba(212, 154, 32, 0.1)',
    },
    Menu: {
      colorBgContainer: 'transparent',
      itemSelectedBg: 'rgba(212, 154, 32, 0.1)',
      itemSelectedColor: '#D49A20',
      itemColor: '#374151',
      itemHoverColor: '#111827',
      itemHoverBg: '#F3F4F6',
    },
    Modal: {
      colorBgContainer: '#FFFFFF',
      colorBgElevated: '#FFFFFF',
      colorText: '#111827',
      colorBorder: '#E5E7EB',
      headerBg: '#FFFFFF',
      contentBg: '#FFFFFF',
    },
    Tag: { borderRadiusSM: 4 },
    Segmented: {
      colorBgLayout: '#FFFFFF',
      borderRadius: 8,
    },
    Slider: {
      trackBg: '#D49A20',
      trackHoverBg: '#BF8718',
      railBg: '#E5E7EB',
    },
    Table: {
      colorBgContainer: '#FFFFFF',
      colorText: '#111827',
      borderColor: '#E5E7EB',
      headerBg: '#F9FAFB',
      rowHoverBg: '#F3F4F6',
    },
    Card: {
      colorBgContainer: '#FFFFFF',
    },
  },
};

/**
 * Get antd theme config by computed theme
 */
export function getThemeConfig(computedTheme: 'dark' | 'light'): ThemeConfig {
  return computedTheme === 'dark' ? darkTheme : lightTheme;
}
