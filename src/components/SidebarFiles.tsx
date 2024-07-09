import React, { MouseEvent, useState } from "react";
import { useSource } from "../context/SourceContext";
import { IFile } from "../sidebar-files";
import FileIcon from "./FileIcon";
import NavFolderItem from "./SidebarFolders";
import { invoke } from "@tauri-apps/api/tauri";
import Modal from "../sidebar-files/Modal";

interface Props {
  files: IFile[];
  visible: boolean;
  depth: number;
}

export default function NavFiles({ files, visible, depth }: Props) {
  const { setSelect, selected, addOpenedFile } = useSource();
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; file: IFile | null }>({ x: 0, y: 0, file: null });
  const [isModalVisible, setIsModalVisible] = useState(false);

  const onShow = async (ev: React.MouseEvent<HTMLDivElement>, file: IFile) => {
    ev.stopPropagation();

    if (file.kind === "file") {
      setSelect(file.id);
      addOpenedFile(file.id);
    }
  };

  const onContextMenu = (ev: React.MouseEvent<HTMLDivElement>, file: IFile) => {
    ev.preventDefault();
    setContextMenu({ x: ev.clientX, y: ev.clientY, file });
    setIsModalVisible(true);
  };

  const onDeleteFile = async () => {
    if (contextMenu.file) {
      console.log("Deleting file:", contextMenu.file.path);
      await invoke("delete_file", { args: { path: contextMenu.file.path } });
      setContextMenu({ x: 0, y: 0, file: null });
      setIsModalVisible(false);
    }
  };

  return (
    <div className={`source-codes ${visible ? "" : "hidden"}`}>
      {files.map((file) => {
        const isSelected = file.id === selected;

        if (file.kind === "directory") {
          return <NavFolderItem active={isSelected} key={file.id} file={file} depth={depth + 1} />;
        }

        return (
          <div
            onClick={(ev) => onShow(ev, file)}
            onContextMenu={(ev) => onContextMenu(ev, file)}
            key={file.id}
            style={{ paddingLeft: `${depth * 5}px` }}
            className={`source-item ${isSelected ? "source-item-active" : ""} flex items-center gap-2 px-2 py-0.5 var(--text-color) cursor-pointer`}
          >
            <FileIcon name={file.name} />
            <span>{file.name}</span>
          </div>
        );
      })}
      <Modal
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onConfirm={onDeleteFile}
      />
    </div>
  );
}