import React from "react";
import PetsOutlined from "@mui/icons-material/PetsOutlined";
import AutoAwesomeOutlined from "@mui/icons-material/AutoAwesomeOutlined";
import EmojiEventsOutlined from "@mui/icons-material/EmojiEventsOutlined";
import { createRoot } from "react-dom/client";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import Chip from "@mui/material/Chip";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Slider from "@mui/material/Slider";
import Stack from "@mui/material/Stack";
import { ThemeProvider } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { appTheme } from "./muiTheme";

const chipRoots = new WeakMap<HTMLElement, ReturnType<typeof createRoot>>();
type MilestoneBadgeConfig = {
  icon: React.ElementType;
  accent: string;
};

const milestoneBadges: Record<string, MilestoneBadgeConfig> = {
  "Color Apprentice": {
    icon: PetsOutlined,
    accent: "#2f6d6f",
  },
  "Palette Keeper": {
    icon: AutoAwesomeOutlined,
    accent: "#8a5a13",
  },
  "Chromatic Master": {
    icon: EmojiEventsOutlined,
    accent: "#8c2f1f",
  },
};

function parseButtonVariant(button: HTMLButtonElement): {
  variant: "contained" | "outlined" | "text";
  color: "primary" | "secondary" | "inherit";
} {
  if (button.classList.contains("btn-primary")) {
    return { variant: "contained", color: "primary" };
  }
  if (button.classList.contains("btn-secondary") || button.classList.contains("btn-accent")) {
    return { variant: "contained", color: "secondary" };
  }
  return { variant: "text", color: "inherit" };
}

export function upgradeMuiButtons(root: ParentNode): void {
  const buttons = root.querySelectorAll<HTMLButtonElement>("button.btn:not([data-mui-upgraded='1'])");

  buttons.forEach((button) => {
    button.dataset.muiUpgraded = "1";
    const mount = document.createElement("span");
    mount.className = "mui-button-proxy";
    button.before(mount);
    button.style.display = "none";

    const rootNode = createRoot(mount);

    const render = (): void => {
      const label = button.textContent?.trim() || "Action";
      const { variant, color } = parseButtonVariant(button);
      rootNode.render(
        <ThemeProvider theme={appTheme}>
          <Button
            variant={variant}
            color={color}
            size={button.classList.contains("mini") ? "small" : "medium"}
            disabled={button.disabled}
            onClick={() => button.click()}
          >
            {label}
          </Button>
        </ThemeProvider>,
      );
    };

    render();

    const observer = new MutationObserver(() => render());
    observer.observe(button, {
      attributes: true,
      attributeFilter: ["class", "disabled"],
      childList: true,
      subtree: true,
      characterData: true,
    });
  });
}

export function renderMuiMilestoneChips(container: HTMLElement, badges: string[]): void {
  let root = chipRoots.get(container);
  if (!root) {
    root = createRoot(container);
    chipRoots.set(container, root);
  }

  root.render(
    <ThemeProvider theme={appTheme}>
      <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap" }}>
        {badges.map((badge) => {
          const badgeConfig = milestoneBadges[badge] ?? {
            icon: EmojiEventsOutlined,
            accent: "#8c2f1f",
          };
          const Icon = badgeConfig.icon;

          return (
            <Chip
              key={badge}
              size="small"
              variant="outlined"
              label={badge}
              icon={<Icon fontSize="small" />}
              sx={{
                bgcolor: "common.white",
                color: "text.primary",
                borderColor: badgeConfig.accent,
                borderWidth: 2,
                fontWeight: 700,
                letterSpacing: "0.01em",
                boxShadow: "0 2px 6px rgba(0, 0, 0, 0.08)",
                "& .MuiChip-label": {
                  px: 1.25,
                  py: 0.2,
                  lineHeight: 1.1,
                },
                "& .MuiChip-icon": {
                  ml: 0.75,
                  mr: -0.25,
                  color: badgeConfig.accent,
                },
              }}
            />
          );
        })}
      </Stack>
    </ThemeProvider>,
  );
}

export function mountMuiSlider(
  container: HTMLElement,
  label: string,
  value: number,
  min: number,
  max: number,
  step: number,
  onInput: (value: number) => void,
): HTMLInputElement {
  const hidden = document.createElement("input");
  hidden.type = "range";
  hidden.min = String(min);
  hidden.max = String(max);
  hidden.step = String(step);
  hidden.value = String(value);
  hidden.style.display = "none";

  const mount = document.createElement("div");
  mount.className = "mui-slider-row";
  container.appendChild(mount);
  container.appendChild(hidden);

  const root = createRoot(mount);

  function SliderRow(): React.JSX.Element {
    const [current, setCurrent] = React.useState(value);
    const precision = step >= 1 ? 0 : 2;

    return (
      <ThemeProvider theme={appTheme}>
        <Stack spacing={1} sx={{ py: 0.5 }}>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            {label}: {current.toFixed(precision)}
          </Typography>
          <Slider
            size="small"
            min={min}
            max={max}
            step={step}
            value={current}
            onChange={(_, next) => {
              const nextValue = Array.isArray(next) ? next[0] : next;
              setCurrent(nextValue);
              hidden.value = String(nextValue);
              onInput(nextValue);
              hidden.dispatchEvent(new Event("input", { bubbles: true }));
            }}
          />
        </Stack>
      </ThemeProvider>
    );
  }

  root.render(<SliderRow />);
  return hidden;
}

export function mountMuiSelect(
  container: HTMLElement,
  label: string,
  options: string[],
  current: string,
  onChange: (value: string) => void,
): HTMLSelectElement {
  const hidden = document.createElement("select");
  hidden.style.display = "none";
  options.forEach((option) => {
    const item = document.createElement("option");
    item.value = option;
    item.textContent = option;
    if (option === current) {
      item.selected = true;
    }
    hidden.appendChild(item);
  });

  const mount = document.createElement("div");
  mount.className = "mui-select-row";
  container.appendChild(mount);
  container.appendChild(hidden);

  const root = createRoot(mount);

  function SelectRow(): React.JSX.Element {
    const [selected, setSelected] = React.useState(current);

    return (
      <ThemeProvider theme={appTheme}>
        <Stack spacing={1} sx={{ py: 0.5 }}>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            {label}
          </Typography>
          <FormControl size="small" fullWidth>
            <Select
              value={selected}
              onChange={(event) => {
                const next = String(event.target.value);
                setSelected(next);
                hidden.value = next;
                onChange(next);
                hidden.dispatchEvent(new Event("change", { bubbles: true }));
              }}
            >
              {options.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </ThemeProvider>
    );
  }

  root.render(<SelectRow />);
  return hidden;
}

export function mountMuiCheckbox(
  container: HTMLElement,
  label: string,
  checked: boolean,
  onChange: (checked: boolean) => void,
): HTMLInputElement {
  const hidden = document.createElement("input");
  hidden.type = "checkbox";
  hidden.checked = checked;
  hidden.style.display = "none";

  const mount = document.createElement("div");
  mount.className = "mui-checkbox-row";
  container.appendChild(mount);
  container.appendChild(hidden);

  const root = createRoot(mount);

  function CheckboxRow(): React.JSX.Element {
    const [value, setValue] = React.useState(checked);

    return (
      <ThemeProvider theme={appTheme}>
        <Box sx={{ py: 0.25 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={value}
                onChange={(event) => {
                  const next = Boolean(event.target.checked);
                  setValue(next);
                  hidden.checked = next;
                  onChange(next);
                  hidden.dispatchEvent(new Event("change", { bubbles: true }));
                }}
              />
            }
            label={label}
          />
        </Box>
      </ThemeProvider>
    );
  }

  root.render(<CheckboxRow />);
  return hidden;
}
