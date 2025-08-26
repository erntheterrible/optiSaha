// Centralised design tokens based on reference UI (pastel gradients, black/white accents)
// These tokens are imported by ThemeContext to generate the MUI theme and reused across components.

// Pastel/coral/peach design tokens for modern dashboard UI
const colors = {
  primary: {
    100: '#fff3ed',
    200: '#ffd6c2',
    300: '#ffb899',
    400: '#ff9a70',
    500: '#ff7b47', // main coral/orange
    600: '#e46b3a',
    700: '#b3552d',
  },
  secondary: {
    100: '#f6f3ff',
    200: '#e6dfff',
    300: '#d1c3ff',
    400: '#b89cff',
    500: '#a685fa', // soft purple
    600: '#7c5cd6',
    700: '#5b3ca6',
  },
  accent: {
    100: '#fffbe7',
    200: '#ffeeb4',
    300: '#ffe180',
    400: '#ffd34d',
    500: '#ffc61a', // yellow accent
  },
  grey: {
    50: '#fafafa',
    100: '#f5f6fa',
    200: '#f0f1f6',
    300: '#e6e7ec',
    400: '#cccccc',
    500: '#b3b3b3',
    600: '#8c8c8c',
    700: '#666666',
    800: '#333333',
    900: '#1a1a1a',
  },
  black: '#111111',
  white: '#ffffff',
};

const gradients = {
  coralPeach: 'linear-gradient(135deg, #ffb899 0%, #ff7b47 100%)',
  purpleBlue: 'linear-gradient(135deg, #b89cff 0%, #7c5cd6 100%)',
  yellowPeach: 'linear-gradient(135deg, #ffe180 0%, #ffb899 100%)',
};

const shadows = {
  card: '0 8px 32px rgba(255, 123, 71, 0.07)',
  nav: '0 2px 6px rgba(171, 140, 228, 0.05)',
};

module.exports = { colors, gradients, shadows };
