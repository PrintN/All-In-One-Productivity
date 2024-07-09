import React, { useEffect, useState, useRef } from "react";
import ReactDOM from "react-dom";
import CodeEditor from "./EditorExtension";
import PhotoEditor from "./PhotoEditorExtension";
import Calendar from "./CalendarExtension";
import Extensions from "./Extensions";
import { IFile } from "../sidebar-files";
import { useSource } from "../context/SourceContext";
import { getFileObject } from "../sidebar-files/file";
import FileIcon from "./FileIcon";
import useHorizontalScroll from "../sidebar-files/useHorizontalScroll";
import PreviewImage from "./PreviewImage";
import { invoke } from '@tauri-apps/api/tauri';
import { localDataDir } from '@tauri-apps/api/path';

const CodeArea: React.FC = () => {
  const { opened, selected, setSelect, delOpenedFile } = useSource();
  const scrollRef = useHorizontalScroll();
  const [files, setFiles] = useState<IFile[]>([]);
  const [hoveredFileId, setHoveredFileId] = useState<string | null>(null);
  const [htmlContent, setHtmlContent] = useState<string | null>(null);
  const extensionComponentRef = useRef<HTMLDivElement>(null);
  const currentExtension = localStorage.getItem('currentExtension') || '';

  useEffect(() => {
    const initializedFiles = opened.map((id) => getFileObject(id) as IFile);
    setFiles(initializedFiles);
  }, [opened]);

  useEffect(() => {
    if (selected && selected.startsWith("extension.")) {
      const loadExtensionFiles = async () => {
        const extensionName = selected.split("extension.")[1];
        const selectedExtensionDirectories = JSON.parse(localStorage.getItem('selectedExtensionDirectories') || '{}');
        const directoryName = selectedExtensionDirectories[extensionName];

        if (!directoryName) {
          setHtmlContent(null);
          return;
        }

        const appLocalDataDirPath = await localDataDir();
        const htmlFilePath = `${appLocalDataDirPath}/AIOP/Extensions/${directoryName}/index.html`;

        try {
          const storedHtmlContent = await invoke<string>('read_file', { path: htmlFilePath });
          setHtmlContent(storedHtmlContent || null);
        } catch (error) {
          console.error(`Error reading HTML file at path: ${htmlFilePath}`, error);
          setHtmlContent(null);
        }
      };

      loadExtensionFiles();
    } else {
      setHtmlContent(null);
    }
  }, [selected]);

  useEffect(() => {
    return () => {
      if (extensionComponentRef.current) {
        ReactDOM.unmountComponentAtNode(extensionComponentRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (htmlContent && extensionComponentRef.current) {
      const iframe = document.createElement("iframe");
      iframe.style.width = "100%";
      iframe.style.height = "100%";
      iframe.style.border = "none";

      if (extensionComponentRef.current) {
        extensionComponentRef.current.innerHTML = "";
        extensionComponentRef.current.appendChild(iframe);
      }

      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write(htmlContent);
        iframeDoc.close();
      }

      window.addEventListener("message", (event) => {
        if (event.data.type === "TAURI_INVOKE") {
          invoke(event.data.command, event.data.payload)
            .then((response) => {
              iframe.contentWindow?.postMessage(
                { type: "TAURI_INVOKE_RESPONSE", response },
                "*"
              );
            })
            .catch((error) => {
              iframe.contentWindow?.postMessage(
                { type: "TAURI_INVOKE_ERROR", error },
                "*"
              );
            });
        }
      });
    }
  }, [htmlContent]);

  const onSelectItem = (id: string) => {
    if (currentExtension !== "Text Editor" && currentExtension !== "Photo Editor") {
      console.log("Cannot open tab because current extension is:", currentExtension);
      return; // Exit early if currentExtension is not Text Editor or Photo Editor
    }

    setSelect(id);
  };

  const isImage = (name: string) => {
    return [".png", ".gif", ".jpeg", ".jpg", ".bmp"].some((ext) =>
      name.toLowerCase().endsWith(ext)
    );
  };

  const close = (ev: React.MouseEvent<HTMLElement, MouseEvent>, id: string) => {
    ev.stopPropagation();
    delOpenedFile(id);
  };

  const handleFileChange = (id: string) => {
    setFiles((prevFiles) =>
      prevFiles.map((file) =>
        file.id === id ? { ...file, modified: true } : file
      )
    );
  };

  const handleFileSave = (id: string) => {
    setFiles((prevFiles) =>
      prevFiles.map((file) =>
        file.id === id ? { ...file, modified: false } : file
      )
    );
  };

  const handleMouseEnter = (id: string) => {
    setHoveredFileId(id);
  };

  const handleMouseLeave = () => {
    setHoveredFileId(null);
  };

// Filter files based on currentExtension
const filteredFiles = files.filter(file => {
  if (currentExtension === "Photo Editor" && isImage(file.name)) {
    return true;
  }
  if (currentExtension === "Text Editor" && !isImage(file.name)) {
    return true;
  }
  return false;
});

return (
  <div id="code-area" className="w-full h-full">
    <div
      ref={scrollRef}
      className="code-tab-items flex items-center border-b border-stone-800 divide-x divide-stone-800 overflow-x-auto"
    >
      {filteredFiles.map((file) => {
        const active = selected === file.id ? "bg-darken text-gray-400" : "";

          return (
            <div
              onClick={() => onSelectItem(file.id)}
              className={`tab-item shrink-0 px-3 py-1.5 text-gray-500 cursor-pointer hover:text-gray-400 flex items-center gap-2 ${active}`}
              key={file.id}
              onMouseEnter={() => handleMouseEnter(file.id)}
              onMouseLeave={handleMouseLeave}
            >
              <FileIcon name={file.name} size="sm" />
              <span>{file.name}</span>
              {file.modified ? (
                hoveredFileId === file.id ? (
                  <i
                    onClick={(ev) => close(ev, file.id)}
                    className="ri-close-line hover:text-red-400"
                  ></i>
                ) : (
                  <i className="ri-checkbox-blank-circle-fill"></i>
                )
              ) : (
                <i
                  onClick={(ev) => close(ev, file.id)}
                  className="ri-close-line hover:text-red-400"
                ></i>
              )}
            </div>
          );
      })}
    </div>
      <div className="code-contents">
        {selected === "photo" && <PhotoEditor />}
        {selected === "calendar" && <Calendar />}
        {selected === "extensions" && <Extensions />}
        {opened.map((item) => {
          const file = getFileObject(item) as IFile;
          if (!file) return null; // Ensure file is defined
          if (currentExtension === "Photo Editor" && isImage(file.name)) {
            return (
              <PreviewImage
                key={file.id}
                path={file.path}
                active={item === selected}
              />
            );
          } else if (currentExtension === "Text Editor" && !isImage(file.name)) {
            return (
              <CodeEditor
                key={file.id}
                id={file.id}
                active={file.id === selected}
                onChange={() => handleFileChange(file.id)}
                onSave={() => handleFileSave(file.id)}
              />
            );
          }
          return null; // Explicitly return null if neither condition is met
        })}
      </div>
      {selected && selected.startsWith("extension.") && htmlContent && (
        <div className="extension-code">
          <div ref={extensionComponentRef}></div>
        </div>
      )}
    </div>
  );
};

export default CodeArea;