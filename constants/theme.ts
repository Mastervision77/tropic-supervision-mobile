

import { Platform } from 'react-native';
import { Cairo_700Bold } from '@expo-google-fonts/cairo';

const tintColorLight = '#500d75';
const tintColorDark = '#500d75';

export const Colors = {
  light: {
    primary: '#500d75',
    secondary: '#fe6813',
    text: '#11181C',
    background: '#FFFFFF',
    tint: tintColorLight,
    icon: '#500d75',
    tabIconDefault: '#b0a0bb',
    tabIconSelected: tintColorLight,
  },
  dark: {
    primary: '#500d75',
    secondary: '#fe6813',
    text: '#ECEDEE',
    background: '#FFFFFF',
    tint: tintColorDark,
    icon: '#500d75',
    tabIconDefault: '#b0a0bb',
    tabIconSelected: tintColorDark,
  },
};

export const Fonts = {
  ...Platform.select({
    ios: {
      sans: 'system-ui',
      serif: 'ui-serif',
      rounded: 'ui-rounded',
      mono: 'ui-monospace',
      cairo: 'Cairo_700Bold', // أضفنا الخط هنا
    },
    default: {
      sans: 'normal',
      serif: 'serif',
      rounded: 'normal',
      mono: 'monospace',
      cairo: 'Cairo_700Bold',
    },
    web: {
      sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      serif: "Georgia, 'Times New Roman', serif",
      rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
      mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
      cairo: 'Cairo_700Bold',
    },
  }),
};