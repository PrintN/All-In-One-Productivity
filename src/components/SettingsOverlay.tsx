import React, { useState, useRef, useEffect } from "react";
import { useTheme } from "../context/ThemeContext"; // Import ThemeContext
import { CSSProperties } from "react";

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
  const [activeTab, setActiveTab] = useState("theme");
  const [fontFamily, setFontFamily] = useState<string>("Arial, sans-serif");
  const [titlebarBackgroundColor, setPrimaryColor] = useState<string>(
    "#f3f4f6"
  );
  const [sidebarColor, setSidebarColor] = useState<string>("#e5e7eb");
  const [backgroundColor, setBackgroundColor] = useState<string>("#ffffff");
  const [textColor, setTextColor] = useState<string>("#111827");
  const [secondarySidebarColor, setSecondarySidebar] = useState<string>(
    "#111827"
  );
  const [extensionIconColor, setExtensionIcon] = useState<string>("#111827");

  const overlayRef = useRef<HTMLDivElement>(null);

  // Close overlay if clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        overlayRef.current &&
        !overlayRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

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
    setSecondarySidebar(theme.secondarySidebarColor);
    setExtensionIcon(theme.extensionIconColor);
    applyTheme(theme, theme === themePresets.dark ? "dark" : "light");
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "about":
        return (
          <div style={tabContentStyles}>
            <p>The All In One Productivity App is highly extendable, providing a flexible framework that supports a wide range of third-party extensions. This extensibility allows users to tailor the app to their specific needs.</p>
            <p>With a growing library of extensions, the All In One Productivity App ensures that you can build a personalized productivity suite that evolves with your needs, enhancing your efficiency and effectiveness in any professional environment.</p>
          </div>
        );
      case "theme":
        return (
          <div style={tabContentStyles}>
            <div className="mb-4">
              <h2 className="text-lg mb-2">Theme Presets</h2>
              <div className="flex mb-2">
                <button
                  className={`flex-1 mr-2 px-4 py-2 rounded ${
                    activeTab === "theme" ? "bg-gray-300" : "bg-white"
                  }`}
                  onClick={() => applyPresetTheme(themePresets.dark)}
                >
                  Dark Theme
                </button>
                <button
                  className={`flex-1 ml-2 px-4 py-2 rounded ${
                    activeTab === "theme" ? "bg-gray-300" : "bg-white"
                  }`}
                  onClick={() => applyPresetTheme(themePresets.light)}
                >
                  Light Theme
                </button>
              </div>
            </div>
            <div className="mb-4">
              <h2 className="text-lg mb-2">Custom Theme</h2>
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
              <label className="block mb-2">
                Extensions Sidebar Color
              </label>
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
          </div>
        );
      case "documentation":
        return (
          <div style={tabContentStyles}>
            <p className="text-2xl font-semibold">
            For the documentation refer to <a className="text-blue-600 text-2xl" href="https://printn.github.io/All-In-One-Productivity-Web/doc.html" target="_blank">this page</a>
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  // Dynamic styles for the overlay content
  const tabContentStyles: CSSProperties = {
    width: "82%", // Adjusted width to accommodate tabs on the left
    maxHeight: "calc(100vh - 160px)", // Max height based on viewport height minus header and padding
    overflowY: "auto" as 'auto', // Enable vertical scroll if content exceeds height
    padding: "0 20px", // Adjust padding as needed
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        ref={overlayRef}
        className="bg-white p-4 rounded shadow-md text-black flex flex-col"
        style={{ width: "70%", height: "70%" }}
      >
        <div className="flex justify-between">
          <h2 className="text-xl mb-4">Settings</h2>
          <button className="mb-4 text-black self-end" onClick={onClose}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 cursor-pointer"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="flex flex-1 overflow-hidden">
          <div className="flex flex-col mr-4" style={{ maxWidth: "200px" }}>
            <button
              className={`mb-2 px-4 py-2 rounded ${
                activeTab === "about" ? "bg-gray-300" : "bg-white"
              }`}
              onClick={() => handleTabChange("about")}
            >
              About
            </button>
            <button
              className={`mb-2 px-4 py-2 rounded ${
                activeTab === "theme" ? "bg-gray-300" : "bg-white"
              }`}
              onClick={() => handleTabChange("theme")}
            >
              Theme
            </button>
            <button
              className={`mb-2 px-4 py-2 rounded ${
                activeTab === "documentation" ? "bg-gray-300" : "bg-white"
              }`}
              onClick={() => handleTabChange("documentation")}
            >
              Documentation
            </button>
          </div>
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}