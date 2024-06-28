import React, { useState, useEffect } from "react";
import { IFile } from "../sidebar-files";
import { open } from "@tauri-apps/api/dialog";
import NavFolderItem from "./SidebarFolders";
import { readDirectory } from "../sidebar-files/filesys";
import SettingsOverlay from "./SettingsOverlay";
import { useSource } from "../context/SourceContext";
import { useExtensions } from "../context/ExtensionsContext";

export default function Sidebar() {
  const { setSelect } = useSource();
  const [projectName, setProjectName] = useState("");
  const [files, setFiles] = useState<IFile[]>([]);
  const [sidebarWidth, setSidebarWidth] = useState(240);
  const [isResizing, setIsResizing] = useState(false);
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [currentExtension, setCurrentExtension] = useState<string>(() => localStorage.getItem('currentExtension') || 'Text Editor');
  const { activatedExtensions } = useExtensions();

  useEffect(() => {
    const savedProjectName = localStorage.getItem("projectName");
    if (savedProjectName) {
      setProjectName(savedProjectName);
      readDirectory(savedProjectName + '/').then(files => {
        setFiles(files);
      });
    }
  }, []);

  const refreshFiles = () => {
    readDirectory(projectName + '/').then(files => {
      setFiles(files);
    });
  };

  const loadFile = async () => {
    const selected = await open({
      directory: true
    });
  
    if (!selected || typeof selected !== 'string') return;
  
    localStorage.setItem("projectName", selected);
    setProjectName(extractFolderName(selected));
    readDirectory(selected + '/').then(files => {
      setFiles(files);
    });
  };  

  const extractFolderName = (path: string): string => {
    const parts = path.split(/[\\/]/);
    return parts.pop() || '';
  };

  const onMouseDown = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    setIsResizing(true);
  };

  const onMouseMove = (e: MouseEvent) => {
    if (!isResizing) return;
    const newWidth = e.clientX;
    setSidebarWidth(newWidth);
  };

  const onMouseUp = () => {
    setIsResizing(false);
  };

  useEffect(() => {
    if (isResizing) {
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    } else {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    }
    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
  }, [isResizing]);

  const handleButtonClick = (title: string, selected: string) => {
    setCurrentExtension(title);
    localStorage.setItem('currentExtension', title);
    setSelect(selected);
  };

  const handleFileClick = (file: IFile) => {
    if (file.kind === "file") {
      const event = new CustomEvent("fileSelected", { detail: { filePath: file.path, extension: currentExtension } });
      window.dispatchEvent(event);
    }
  };

  return (
    <div className="flex h-full">
      <aside className="secondary-sidebar h-full bg-darken flex flex-col items-center py-4">
        <button className={`sidebar-icon mb-4 ${currentExtension === "Text Editor" ? "active-extension" : ""}`} title="Text Editor" onClick={() => handleButtonClick("Text Editor", "text")}>
          <i className="ri-file-text-line w-6 h-6"></i>
        </button>
        <button className={`sidebar-icon mb-4 ${currentExtension === "Photo Editor" ? "active-extension" : ""}`} title="Photo Editor" onClick={() => handleButtonClick("Photo Editor", "photo")}>
          <i className="ri-image-line w-6 h-6"></i>
        </button>
        <button className={`sidebar-icon mb-4 ${currentExtension === "Calendar" ? "active-extension" : ""}`} title="Calendar" onClick={() => handleButtonClick("Calendar", "calendar")}>
          <i className="ri-calendar-line w-6 h-6"></i>
        </button>
        {activatedExtensions.map(extension => (
          <div key={extension.key} className="mb-4">
            <button className={`sidebar-icon ${currentExtension === extension.name ? "active-extension" : ""}`} title={extension.name} onClick={() => handleButtonClick(extension.name, `extension.${extension.name}`)}>
              <i className={`${extension.iconClass} w-6 h-6`}></i>
            </button>
          </div>
        ))}
        <div className="mt-auto">
          <button className={`sidebar-icon mb-4 ${currentExtension === "Extensions" ? "active-extension" : ""}`} title="Extensions" onClick={() => handleButtonClick("Extensions", "extensions")}>
            <i className="ri-puzzle-line w-6 h-6" />
          </button>
          <button className="sidebar-icon" title="Settings" onClick={() => setIsOverlayOpen(true)}>
            <i className="ri-settings-2-line w-6 h-6"></i>
          </button>
        </div>
      </aside>

      <aside id="sidebar" style={{ width: sidebarWidth, position: 'relative', WebkitUserSelect: 'none', MozUserSelect: 'none'}} className="shrink-0 h-full bg-darken">
        <div className="sidebar-header flex items-center justify-between p-4 py-2.5">
          <button className="project-explorer" onClick={loadFile}>File explorer</button>
        </div>
        <div className="code-structure">
          <NavFolderItem file={{ id: "main-folder", name: projectName, path: projectName, kind: 'directory', modified: false }} active={false} refreshFiles={refreshFiles} depth={0} />
        </div>
        <div
          onMouseDown={onMouseDown}
          style={{ cursor: 'ew-resize', width: '5px', backgroundColor: 'gray', height: '100%', position: 'absolute', right: '0', top: '0'}}
        ></div>
        {isOverlayOpen && <SettingsOverlay onClose={() => setIsOverlayOpen(false)} />}
      </aside>
    </div>
  );
}

interface ExtensionInfo {
  name: string;
  description: string;
  author: string;
  creationDate: string;
  version: string;
  iconClass: string; // The class name for the Remixicon
}

interface ActivatedExtension extends ExtensionInfo {
  isActive: boolean;
  key: string; // Unique key for each activated extension
}