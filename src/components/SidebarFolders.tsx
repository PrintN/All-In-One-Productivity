import { nanoid } from "nanoid";
import { useState } from "react";
import { readDirectory, writeFile } from "../sidebar-files/filesys";
import { saveFileObject } from "../sidebar-files/file";
import { IFile } from "../sidebar-files";
import NavFiles from "./SidebarFiles";
import { invoke } from "@tauri-apps/api/tauri";
import Modal from "../sidebar-files/Modal";

interface Props {
  file: IFile;
  active: boolean;
  refreshFiles: () => void;
  depth: number; // Add depth prop
}

export default function NavFolderItem({ file, active, refreshFiles, depth }: Props) {
  const [files, setFiles] = useState<IFile[]>([])
  const [unfold, setUnfold] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [newFile, setNewFile] = useState(false)
  const [filename, setFilename] = useState('')
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; file: IFile | null }>({ x: 0, y: 0, file: null });
  const [isModalVisible, setIsModalVisible] = useState(false);

  const onShow = async (ev: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
    ev.stopPropagation()

    if (loaded) {
      setUnfold(!unfold)
      return;
    }

    const entries = await readDirectory(file.path + '/')

    setLoaded(true)
    setFiles(entries)
    setUnfold(!unfold)
  }

  const onEnter = (key: string) => { 
    if (key === 'Escape') {
      setNewFile(false)
      setFilename('')
      return;
    }

    if (key !== 'Enter') return;

    const filePath = `${file.path}/${filename}`
    
    writeFile(filePath, '').then(() => {
      const id = nanoid();
      const newFile: IFile = {
        id,
        name: filename,
        path: filePath,
        kind: 'file',
        modified: false
      }

      saveFileObject(id, newFile)
      setFiles(prevEntries => [newFile, ...prevEntries])
      setNewFile(false)
      setFilename('')
      console.log("File created, refreshing files...");
      refreshFiles();
    })
  }

  const onContextMenu = (ev: React.MouseEvent<HTMLDivElement>, file: IFile) => {
    ev.preventDefault();
    setContextMenu({ x: ev.clientX, y: ev.clientY, file });
    setIsModalVisible(true);
  };

  const onDeleteFile = async () => {
    if (contextMenu.file) {
      console.log("Deleting file:", contextMenu.file.path);
      await invoke("delete_file", { args: { path: contextMenu.file.path } });
      setFiles(files.filter(f => f.id !== contextMenu.file?.id)); // Remove the file from the state
      setContextMenu({ x: 0, y: 0, file: null });
      setIsModalVisible(false);
      console.log("Refreshing files...");
      refreshFiles();
    }
  };

  return (
    <div className="soure-item">
      <div
        className={`source-folder ${active ? 'var(--text-color)' : ''} flex items-center gap-2 px-2 py-0.5 var(--text-color) cursor-pointer`}
        onContextMenu={(ev) => onContextMenu(ev, file)}
        style={{ paddingLeft: `${depth * 10}px` }} // Indent based on depth
      >
        <i className="ri-folder-fill text-yellow-500"></i>
        <div className="source-header flex items-center justify-between w-full group">
          <span onClick={onShow}>{file.name}</span>
          <i onClick={() => setNewFile(true)} className="ri-add-line invisible group-hover:visible"></i>
        </div>
      </div>

      {newFile ? (
        <div className="mx-4 flex items-center gap-0.5 p-2">
          <i className="ri-file-edit-line text-gray-300"></i>
          <input
            type="text"
            value={filename}
            onChange={(ev) => setFilename(ev.target.value)}
            onKeyUp={(ev) => onEnter(ev.key)}
            className="inp"
          />
        </div>
      ) : null}

      <NavFiles visible={unfold} files={files} refreshFiles={refreshFiles} depth={depth + 1} />
      {contextMenu.file && (
        <Modal
          isVisible={isModalVisible}
          onClose={() => setIsModalVisible(false)}
          onConfirm={onDeleteFile}
        />
      )}
    </div>
  );
}