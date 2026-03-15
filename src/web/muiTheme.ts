import { createTheme } from "@mui/material/styles";

// Palette: #3F9AAE (primary teal), #79C9C5 (secondary light-teal),
//          #FFE2AF (background cream), #F96E5B (accent coral)
export const appTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#3F9AAE",
      light: "#79C9C5",
      dark: "#2d7a8a",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#79C9C5",
      light: "#a8dedd",
      dark: "#4fa8a5",
      contrastText: "#1f2030",
    },
    background: {
      default: "#FFE2AF",
      paper: "#ffffff",
    },
    text: {
      primary: "#1f2030",
      secondary: "#4f5a72",
    },
    divider: "rgba(31, 32, 48, 0.12)",
    error: {
      main: "#F96E5B",
    },
  },
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontFamily: '"Space Grotesk", sans-serif',
    h3: {
      fontFamily: '"Fraunces", serif',
      fontWeight: 700,
    },
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 700,
          borderWidth: 2,
        },
        containedPrimary: {
          backgroundColor: "#3F9AAE",
          color: "#ffffff",
          "&:hover": {
            backgroundColor: "#2d7a8a",
          },
        },
        containedSecondary: {
          backgroundColor: "#79C9C5",
          color: "#1f2030",
          "&:hover": {
            backgroundColor: "#4fa8a5",
          },
        },
        outlinedPrimary: {
          borderColor: "#3F9AAE",
          color: "#3F9AAE",
          "&:hover": {
            borderColor: "#2d7a8a",
            backgroundColor: "rgba(63, 154, 174, 0.06)",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          boxShadow: "none",
          border: "1px solid rgba(31, 32, 48, 0.12)",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          backgroundColor: "#FFE2AF",
          color: "#1f2030",
          fontWeight: 600,
        },
      },
    },
    MuiSlider: {
      styleOverrides: {
        root: ({ theme }) => ({
          color: theme.palette.primary.main,
        }),
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: ({ theme }) => ({
          color: theme.palette.primary.main,
          "&.Mui-checked": {
            color: theme.palette.primary.main,
          },
        }),
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: ({ theme }) => ({
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: theme.palette.primary.main,
          },
        }),
      },
    },
  },
});
