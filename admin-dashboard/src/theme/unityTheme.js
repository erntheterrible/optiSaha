import { createTheme } from '@mui/material/styles';

const unityTheme = createTheme({
  palette: {
    gradients: {
      coralPeach: 'linear-gradient(135deg, #00b8d9 0%, #0088cc 100%)',
      purpleBlue: 'linear-gradient(135deg, #305CDE 0%, #2651C9 100%)',
      yellowPeach: 'linear-gradient(135deg, #36b37e 0%, #00875a 100%)',
      header: 'linear-gradient(90deg, #305CDE 0%, #2651C9 100%)',
    },
    primary: { 
      main: '#305CDE',
      light: '#4B74E6',
      dark: '#2651C9',
      contrastText: '#ffffff'
    },
    secondary: { 
      main: '#36b37e',
      light: '#50c878',
      dark: '#00875a',
      contrastText: '#ffffff'
    },
    background: {
      default: '#F8F9FA',
      paper: '#ffffff',
      sidebar: '#305CDE',
    },
    text: {
      primary: '#333333',
      secondary: '#6c757d',
      light: '#ffffff',
    },
    info: { main: '#00b8d9' },
    success: { main: '#36b37e' },
    warning: { main: '#ffab00' },
    error: { main: '#ff5630' },
    divider: '#e3e8ee',
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: 'Roboto, "Helvetica Neue", Arial, sans-serif',
    h1: { fontWeight: 700, letterSpacing: '-0.5px' },
    h2: { fontWeight: 700, letterSpacing: '-0.5px' },
    h3: { fontWeight: 700, letterSpacing: '-0.3px' },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
    subtitle1: { fontWeight: 500 },
    subtitle2: { fontWeight: 500 },
  },
  shadows: [
  'none',
  '0px 1px 3px 0px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 2px 1px -1px rgba(0,0,0,0.12)',
  '0px 1.5px 5px 0px rgba(0,0,0,0.2),0px 3px 4px 0px rgba(0,0,0,0.14),0px 1.5px 10px 0px rgba(0,0,0,0.12)',
  '0px 3px 5px -1px rgba(0,0,0,0.2),0px 6px 10px 0px rgba(0,0,0,0.14),0px 1px 18px 0px rgba(0,0,0,0.12)',
  '0px 2px 4px -1px rgba(0,0,0,0.2),0px 4px 5px 0px rgba(0,0,0,0.14),0px 1px 10px 0px rgba(0,0,0,0.12)',
  '0px 3px 5px -1px rgba(0,0,0,0.2),0px 6px 10px 0px rgba(0,0,0,0.14),0px 1px 18px 0px rgba(0,0,0,0.12)',
  '0px 5px 5px -3px rgba(0,0,0,0.2),0px 8px 10px 1px rgba(0,0,0,0.14),0px 3px 14px 2px rgba(0,0,0,0.12)',
  '0px 7px 8px -4px rgba(0,0,0,0.2),0px 12px 17px 2px rgba(0,0,0,0.14),0px 5px 22px 4px rgba(0,0,0,0.12)',
  '0px 8px 10px -5px rgba(0,0,0,0.2),0px 16px 24px 2px rgba(0,0,0,0.14),0px 6px 30px 5px rgba(0,0,0,0.12)',
  '0px 9px 12px -6px rgba(0,0,0,0.2),0px 20px 32px 3px rgba(0,0,0,0.14),0px 7px 40px 7px rgba(0,0,0,0.12)',
  '0px 10px 14px -7px rgba(0,0,0,0.2),0px 24px 40px 4px rgba(0,0,0,0.14),0px 8px 50px 8px rgba(0,0,0,0.12)',
  '0px 11px 15px -8px rgba(0,0,0,0.2),0px 28px 48px 5px rgba(0,0,0,0.14),0px 9px 60px 9px rgba(0,0,0,0.12)',
  '0px 12px 17px -9px rgba(0,0,0,0.2),0px 32px 56px 6px rgba(0,0,0,0.14),0px 10px 70px 10px rgba(0,0,0,0.12)',
  '0px 13px 19px -10px rgba(0,0,0,0.2),0px 36px 64px 7px rgba(0,0,0,0.14),0px 11px 80px 11px rgba(0,0,0,0.12)',
  '0px 14px 21px -11px rgba(0,0,0,0.2),0px 40px 72px 8px rgba(0,0,0,0.14),0px 12px 90px 12px rgba(0,0,0,0.12)',
  '0px 15px 23px -12px rgba(0,0,0,0.2),0px 44px 80px 9px rgba(0,0,0,0.14),0px 13px 100px 13px rgba(0,0,0,0.12)',
  '0px 16px 24px -13px rgba(0,0,0,0.2),0px 48px 88px 10px rgba(0,0,0,0.14),0px 14px 110px 14px rgba(0,0,0,0.12)',
  '0px 17px 26px -14px rgba(0,0,0,0.2),0px 52px 96px 11px rgba(0,0,0,0.14),0px 15px 120px 15px rgba(0,0,0,0.12)',
  '0px 18px 28px -15px rgba(0,0,0,0.2),0px 56px 104px 12px rgba(0,0,0,0.14),0px 16px 130px 16px rgba(0,0,0,0.12)',
  '0px 19px 30px -16px rgba(0,0,0,0.2),0px 60px 112px 13px rgba(0,0,0,0.14),0px 17px 140px 17px rgba(0,0,0,0.12)',
  '0px 20px 32px -17px rgba(0,0,0,0.2),0px 64px 120px 14px rgba(0,0,0,0.14),0px 18px 150px 18px rgba(0,0,0,0.12)',
  '0px 21px 34px -18px rgba(0,0,0,0.2),0px 68px 128px 15px rgba(0,0,0,0.14),0px 19px 160px 19px rgba(0,0,0,0.12)',
  '0px 22px 36px -19px rgba(0,0,0,0.2),0px 72px 136px 16px rgba(0,0,0,0.14),0px 20px 170px 20px rgba(0,0,0,0.12)',
  '0px 23px 38px -20px rgba(0,0,0,0.2),0px 76px 144px 17px rgba(0,0,0,0.14),0px 21px 180px 21px rgba(0,0,0,0.12)',
  '0px 24px 40px -21px rgba(0,0,0,0.2),0px 80px 152px 18px rgba(0,0,0,0.14),0px 22px 190px 22px rgba(0,0,0,0.12)'
],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        '*': {
          boxSizing: 'border-box',
        },
        html: {
          margin: 0,
          padding: 0,
          width: '100%',
          height: '100%',
          WebkitOverflowScrolling: 'touch',
        },
        body: {
          margin: 0,
          padding: 0,
          width: '100%',
          height: '100%',
        },
        '#root': {
          width: '100%',
          height: '100%',
        },
        input: {
          '&[type=number]': {
            MozAppearance: 'textfield',
            '&::-webkit-outer-spin-button': {
              margin: 0,
              WebkitAppearance: 'none',
            },
            '&::-webkit-inner-spin-button': {
              margin: 0,
              WebkitAppearance: 'none',
            },
          },
        },
        img: {
          display: 'block',
          maxWidth: '100%',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          border: 'none',
          transition: 'box-shadow 0.3s ease-in-out',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #00b8d9 0%, #0088cc 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #00a0c0 0%, #0077b3 100%)',
          },
        },
        containedSecondary: {
          background: 'linear-gradient(135deg, #36b37e 0%, #00875a 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #2da36f 0%, #00764e 100%)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: '#ffffff',
          color: '#333333',
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
          borderBottom: '1px solid #e3e8ee',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: '#1C2841',
          color: '#ffffff',
          boxShadow: '2px 0 8px rgba(0,0,0,0.15)',
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          width: 40,
          height: 40,
          borderRadius: '50%',
          border: '2px solid #ffffff',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          color: 'rgba(255,255,255,0.7)',
          minWidth: 40,
          '& svg': {
            fontSize: 22,
          },
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          marginBottom: 4,
          marginLeft: 8,
          marginRight: 8,
          padding: '10px 16px',
          '&.Mui-selected': {
            backgroundColor: 'rgba(0,136,204,0.15)',
            '& .MuiListItemIcon-root': {
              color: '#00b8d9',
            },
            '&:hover': {
              backgroundColor: 'rgba(0,136,204,0.25)',
            },
          },
          '&:hover': {
            backgroundColor: 'rgba(255,255,255,0.08)',
          },
        },
      },
    },
    MuiListItemText: {
      styleOverrides: {
        primary: {
          fontSize: 14,
          fontWeight: 500,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid #e3e8ee',
          padding: '16px 24px',
        },
        head: {
          backgroundColor: '#F8F9FA',
          color: '#6c757d',
          fontWeight: 600,
          fontSize: '0.875rem',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          fontWeight: 500,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          fontSize: '0.875rem',
          textTransform: 'none',
          padding: '12px 24px',
          minWidth: 'auto',
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          height: 3,
          borderTopLeftRadius: 3,
          borderTopRightRadius: 3,
        },
      },
    },
  },
});

export default unityTheme;
