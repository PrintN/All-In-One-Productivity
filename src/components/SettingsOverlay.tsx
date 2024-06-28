import React, { useState } from "react";
import { useTheme } from "../context/ThemeContext"; // Import ThemeContext

interface SettingsOverlayProps {
  onClose: () => void;
}

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
    extensionIconColor: "#ffffff",
  },
};

export default function SettingsOverlay({ onClose }: SettingsOverlayProps) {
  const { applyTheme } = useTheme(); // Use ThemeContext
  const [fontFamily, setFontFamily] = useState<string>("Arial, sans-serif");
  const [titlebarBackgroundColor, setPrimaryColor] = useState<string>("#f3f4f6");
  const [sidebarColor, setSidebarColor] = useState<string>("#e5e7eb");
  const [backgroundColor, setBackgroundColor] = useState<string>("#ffffff");
  const [textColor, setTextColor] = useState<string>("#111827");
  const [secondarySidebarColor, setSecondarySidebar] = useState<string>("#111827");
  const [extensionIconColor, setExtensionIcon] = useState<string>("#111827");

  const applyCustomStyles = () => {
    const customTheme = {
      fontFamily,
      titlebarBackgroundColor,
      sidebarColor,
      backgroundColor,
      textColor,
      secondarySidebarColor,
      extensionIconColor,
    };
    applyTheme(customTheme, "custom");
  };

  const applyPresetTheme = (theme: any) => {
    setFontFamily(theme.fontFamily);
    setPrimaryColor(theme.titlebarBackgroundColor);
    setSidebarColor(theme.sidebarColor);
    setBackgroundColor(theme.backgroundColor);
    setTextColor(theme.textColor);
    setSecondarySidebar(theme.secondarySidebarColor)
    setExtensionIcon(theme.extensionIconColor)
    applyTheme(theme, theme === themePresets.dark ? "dark" : "light");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded shadow-md text-black">
        <h2 className="text-xl mb-4">Settings</h2>
        <button className="block mb-2" onClick={() => applyPresetTheme(themePresets.dark)}>
          Dark Theme
        </button>
        <button className="block mb-2" onClick={() => applyPresetTheme(themePresets.light)}>
          Light Theme
        </button>
        <div className="mb-4">
          <label className="block mb-2">Font Family</label>
          <input
            type="text"
            value={fontFamily}
            onChange={(e) => setFontFamily(e.target.value)}
            onBlur={applyCustomStyles}
            className="border p-2 w-full"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2">Titlebar Background Color</label>
          <input
            type="color"
            value={titlebarBackgroundColor}
            onChange={(e) => setPrimaryColor(e.target.value)}
            onBlur={applyCustomStyles}
            className="border p-2 w-full"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2">Sidebar Color</label>
          <input
            type="color"
            value={sidebarColor}
            onChange={(e) => setSidebarColor(e.target.value)}
            onBlur={applyCustomStyles}
            className="border p-2 w-full"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2">Background Color</label>
          <input
            type="color"
            value={backgroundColor}
            onChange={(e) => setBackgroundColor(e.target.value)}
            onBlur={applyCustomStyles}
            className="border p-2 w-full"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2">Text Color</label>
          <input
            type="color"
            value={textColor}
            onChange={(e) => setTextColor(e.target.value)}
            onBlur={applyCustomStyles}
            className="border p-2 w-full"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2">Extensions Sidebar Color</label>
          <input
            type="color"
            value={secondarySidebarColor}
            onChange={(e) => setSecondarySidebar(e.target.value)}
            onBlur={applyCustomStyles}
            className="border p-2 w-full"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2">Extension Icon Color</label>
          <input
            type="color"
            value={extensionIconColor}
            onChange={(e) => setExtensionIcon(e.target.value)}
            onBlur={applyCustomStyles}
            className="border p-2 w-full"
          />
        </div>
        <button
          className="mt-4 text-black"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
}