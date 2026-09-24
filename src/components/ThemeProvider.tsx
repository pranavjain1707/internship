import { createContext, useContext, useEffect, useState } from "react";

export type Theme = "dark" | "light" | "ocean" | "rose" | "purple";

const THEME_ORDER: Theme[] = ["light", "dark", "ocean", "rose", "purple"];

export const THEME_LABELS: Record<Theme, string> = {
  light: "Light",
  dark: "Olive Dark",
  ocean: "Ocean Blue",
  rose: "Rose Gold",
  purple: "Midnight Purple",
};

type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
  cycleTheme: () => void;
  setTheme: (t: Theme) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      const storedTheme = localStorage.getItem("theme") as Theme;
      if (THEME_ORDER.includes(storedTheme)) {
        return storedTheme;
      }
      // Default to dark mode to match original aesthetic
      return "dark";
    }
    return "dark";
  });

  useEffect(() => {
    const root = window.document.documentElement;

    // Remove all theme classes
    root.classList.remove("dark", "theme-ocean", "theme-rose", "theme-purple");

    // Apply the appropriate classes
    switch (theme) {
      case "dark":
        root.classList.add("dark");
        root.style.colorScheme = "dark";
        break;
      case "ocean":
        root.classList.add("dark", "theme-ocean");
        root.style.colorScheme = "dark";
        break;
      case "rose":
        root.classList.add("theme-rose");
        root.style.colorScheme = "light";
        break;
      case "purple":
        root.classList.add("dark", "theme-purple");
        root.style.colorScheme = "dark";
        break;
      default: // "light"
        root.style.colorScheme = "light";
        break;
    }

    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setThemeState((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const cycleTheme = () => {
    setThemeState((prev) => {
      const idx = THEME_ORDER.indexOf(prev);
      return THEME_ORDER[(idx + 1) % THEME_ORDER.length];
    });
  };

  const setTheme = (t: Theme) => {
    setThemeState(t);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, cycleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
