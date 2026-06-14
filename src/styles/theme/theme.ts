import { createTheme } from '@mui/material/styles';

const commonThemeOptions = {
  typography: {
    fontFamily: ['Inter'].join(','),
    h1: {
      fontSize: '2rem',
      fontWeight: 600,
    },
    h2: {
      fontSize: '1.75rem',
      fontWeight: 500,
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 500,
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 500,
    },
    h5: {
      fontSize: '1rem',
      fontWeight: 500,
    },
    h6: {
      fontSize: '0.875rem',
      fontWeight: 500,
    },
    body1: {
      fontSize: '1rem',
      fontWeight: 400,
      lineHeight: 1.5,
      letterSpacing: 0,
    },

    body2: {
      fontSize: '0.875rem',
      fontWeight: 400,
      lineHeight: 1.4,
      letterSpacing: 0,
    },
  },
  spacing: 8,
  shape: {
    borderRadius: 4,
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
  palette: {
    info: {
      main: '#1bb7f0',
    },
    success: {
      main: '#27e18a',
    },
    error: {
      main: '#ff5f66',
    },
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
          letterSpacing: 0,
          textTransform: 'none' as const,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 6,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundImage: 'none',
          borderRadius: 8,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundImage: 'none',
        },
      },
    },
    MuiPopover: {
      styleOverrides: {
        paper: {
          backgroundImage: 'none',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          letterSpacing: 0,
          minHeight: 44,
          textTransform: 'none' as const,
        },
      },
    },
  },
};

const lightTheme = createTheme({
  ...commonThemeOptions,
  palette: {
    mode: 'light',
    primary: {
      main: '#0b8fd3',
      dark: '#0871af',
      light: '#d8f4ff',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#f2b84b',
    },
    info: {
      main: '#0b8fd3',
    },
    success: {
      main: '#2f9e44',
    },
    error: {
      main: '#dc2626',
    },
    background: {
      default: '#f5f7f8',
      paper: '#ffffff',
    },
    text: {
      primary: '#111827',
      secondary: '#667085',
    },
  },
});

const darkTheme = createTheme({
  ...commonThemeOptions,
  palette: {
    mode: 'dark',
    primary: {
      main: '#18bdf2',
      dark: '#0e82d8',
      light: '#7adfff',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#f4c76b',
    },
    info: {
      main: '#18bdf2',
    },
    success: {
      main: '#22e38a',
    },
    error: {
      main: '#ff5f66',
    },
    background: {
      default: '#07141C',
      paper: '#0e1622',
    },
    text: {
      primary: '#f4f8fb',
      secondary: '#9dafba',
    },
  },
});

export { lightTheme, darkTheme };
