import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface ThemeContextProps {
  theme: string;
  setTheme: (theme: string) => void;
  applyTheme: (theme: typeof themePresets.dark, themeName: string) => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

const themePresets = {
  dark: {
    fontFamily: "Arial, sans-serif",
    titlebarBackgroundColor: "#1f2937",
    sidebarColor: "#4b5563",
    backgroundColor: "#111827",
    textColor: "#f9fafb",
    secondarySidebarColor: "#444741",
    extensionIconColor: "#ffffff",
  },
  light: {
    fontFamily: "Arial, sans-serif",
    titlebarBackgroundColor: "#f3f4f6",
    sidebarColor: "#e5e7eb",
    backgroundColor: "#ffffff",
    textColor: "#111827",
    secondarySidebarColor: "#444741",
    extensionIconColor: "#ffffff"
  },
};

interface ThemeProviderProps {
  children: ReactNode; // Define children prop as ReactNode
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<string>("");

  useEffect(() => {
    // Load theme from localStorage and apply it
    const storedThemeData = localStorage.getItem("themeData");
    if (storedThemeData) {
      const {
        themeName,
        fontFamily,
        titlebarBackgroundColor,
        sidebarColor,
        backgroundColor,
        textColor,
        secondarySidebarColor,
        extensionIconColor,
      } = JSON.parse(storedThemeData);

      if (themeName === "dark" || themeName === "light") {
        applyTheme(themePresets[themeName as "dark" | "light"], themeName);
      } else {
        document.documentElement.style.setProperty("--font-family", fontFamily);
        document.documentElement.style.setProperty("--titlebar-background-color", titlebarBackgroundColor);
        document.documentElement.style.setProperty("--sidebar-color", sidebarColor);
        document.documentElement.style.setProperty("--background-color", backgroundColor);
        document.documentElement.style.setProperty("--text-color", textColor);
        document.documentElement.style.setProperty("--secondary-sidebar-color", secondarySidebarColor);
        document.documentElement.style.setProperty("--extension-icon-color", extensionIconColor);
      }
      setTheme(themeName);
    } else {
      // If no theme data is found, apply the dark theme by default
      applyTheme(themePresets.dark, "dark");
    }
  }, []);

  const applyTheme = (theme: typeof themePresets.dark, themeName: string) => {
    document.documentElement.style.setProperty("--font-family", theme.fontFamily);
    document.documentElement.style.setProperty("--titlebar-background-color", theme.titlebarBackgroundColor);
    document.documentElement.style.setProperty("--sidebar-color", theme.sidebarColor);
    document.documentElement.style.setProperty("--background-color", theme.backgroundColor);
    document.documentElement.style.setProperty("--text-color", theme.textColor);
    document.documentElement.style.setProperty("--secondary-sidebar-color", theme.secondarySidebarColor);
    document.documentElement.style.setProperty("--extension-icon-color", theme.extensionIconColor);

    const themeData = {
      themeName,
      fontFamily: theme.fontFamily,
      titlebarBackgroundColor: theme.titlebarBackgroundColor,
      sidebarColor: theme.sidebarColor,
      backgroundColor: theme.backgroundColor,
      textColor: theme.textColor,
      secondarySidebarColor: theme.secondarySidebarColor,
      extensionIconColor: theme.extensionIconColor,
    };

    localStorage.setItem("themeData", JSON.stringify(themeData));
    setTheme(themeName);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, applyTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};