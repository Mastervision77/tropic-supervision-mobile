

import { Platform } from 'react-native';
import { Cairo_700Bold } from '@expo-google-fonts/cairo';

const tintColorLight = '#ea7b25 ';
const tintColorDark = '#0f83b0';

export const Colors = {
  light: {
    primary: '#ea7b25 ', 
    secondary: '#0f83b0', 
    text: '#000',
    textBlack: '#000',
    background: '#FFFFFF',
    tint: tintColorLight,
    icon: '#500d75',
    tabIconDefault: '#b0a0bb',
    tabIconSelected: tintColorLight,
  },
  dark: {
    primary: '#0f83b0',
    secondary: '#ea7b25',
    text: '#ECEDEE',
    background: '#FFFFFF',
    tint: tintColorDark,
    icon: '#ea7b25',
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