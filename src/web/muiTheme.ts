import { createTheme } from "@mui/material/styles";

export const appTheme = createTheme({
  palette: {
    mode: "light",
    // 60 / 30 / 10 rule:
    // 60% warm neutral base, 30% cool support tones, 10% accent actions.
    primary: {
      main: "#355070",
      light: "#4c6b8f",
      dark: "#26384f",
      contrastText: "#f8fafc",
    },
    secondary: {
      main: "#e07a2d",
      light: "#ec9553",
      dark: "#c76418",
      contrastText: "#2f1e10",
    },
    background: {
      default: "#f6f2e9",
      paper: "#e8e1d2",
    },
    text: {
      primary: "#2a2e35",
      secondary: "#4b5563",
    },
    divider: "#c9beaa",
  },
  shape: {
    borderRadius: 10,
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
          backgroundColor: "#355070",
          color: "#f8fafc",
          "&:hover": {
            backgroundColor: "#26384f",
          },
        },
        containedSecondary: {
          backgroundColor: "#e07a2d",
          color: "#2f1e10",
          "&:hover": {
            backgroundColor: "#c76418",
          },
        },
        outlinedPrimary: {
          borderColor: "#355070",
          color: "#355070",
          "&:hover": {
            borderColor: "#26384f",
            backgroundColor: "rgba(53, 80, 112, 0.06)",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          boxShadow: "none",
          border: "1px solid #c9beaa",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          backgroundColor: "#d8cfbe",
          color: "#2a2e35",
          fontWeight: 600,
        },
      },
    },
  },
});
