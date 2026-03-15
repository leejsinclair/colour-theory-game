import React from "react";
import { CssBaseline, ThemeProvider } from "@mui/material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { appTheme } from "./muiTheme";

export function AppShell() {
  const [isGameReady, setIsGameReady] = React.useState(false);

  React.useEffect(() => {
    const onReady = (): void => setIsGameReady(true);
    window.addEventListener("ctg:ready", onReady);
    return () => window.removeEventListener("ctg:ready", onReady);
  }, []);

  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <Container maxWidth="xl" className="app-shell mui-shell">
        <Box className="hero" sx={{ mb: 2.5 }}>
          <Typography className="eyebrow">Chromatic Mastery</Typography>
          <Typography variant="h3" component="h1">
            Color Studio Prototype
          </Typography>
          <Typography className="subhead">Solve station puzzles, free pets, and relight the studio.</Typography>
        </Box>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 5 }}>
            <Stack spacing={2}>
              <Card className="panel-card progress-card" variant="outlined">
                <CardContent>
                  <Typography variant="h6" component="h2" sx={{ mb: 1 }}>
                    Progress
                  </Typography>

                  <Box className="hud" id="hud">
                    <Box className="hud-stat" id="hud-score">
                      <Box className="hud-stat-value" id="hud-score-value">0</Box>
                      <Box className="hud-stat-label">Score</Box>
                    </Box>
                    <Box className="hud-stat" id="hud-pets">
                      <Box className="hud-stat-value" id="hud-pets-value">0/18</Box>
                      <Box className="hud-stat-label">Pets</Box>
                    </Box>
                    <Box className="hud-stat" id="hud-streak">
                      <Box className="hud-stat-value" id="hud-streak-value">0</Box>
                      <Box className="hud-stat-label">Best Streak</Box>
                    </Box>
                  </Box>

                  <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" className="milestone-badges" id="milestone-badges" sx={{ mt: 1 }} />
                  <Box className="pet-collection" id="pet-collection" aria-label="Collected pets" sx={{ mt: 1.5 }} />

                  <pre id="progress" style={{ marginTop: "0.8rem" }} />
                </CardContent>
              </Card>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 7 }}>
            <Card className="panel-card" variant="outlined" sx={{ height: "100%" }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                  <Typography variant="h6" component="h2">Puzzles</Typography>
                </Stack>
                <Box id="puzzle-list" className="puzzle-list" />
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Card className="panel-card" variant="outlined" sx={{ mt: 2 }}>
          <CardContent>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
              <Button id="auto-solve" variant="contained" color="primary" disabled={!isGameReady}>Auto Solve Journey</Button>
              <Button id="reset" variant="text" color="inherit" disabled={!isGameReady}>Reset Run</Button>
            </Stack>
          </CardContent>
        </Card>
      </Container>

      <Box className="toast-container" id="toast-container" />

      <div className="info-modal-overlay" id="info-modal" role="dialog" aria-modal="true" aria-labelledby="info-modal-title" hidden>
        <div className="info-modal-card">
          <div className="info-modal-header">
            <h3 className="info-modal-title" id="info-modal-title"></h3>
            <button className="info-modal-close" id="info-modal-close" aria-label="Close">
              \u2715
            </button>
          </div>
          <div className="info-modal-body" id="info-modal-body"></div>
        </div>
      </div>
    </ThemeProvider>
  );
}
