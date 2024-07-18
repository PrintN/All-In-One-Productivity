import React, { useRef } from 'react';
import { convertFileSrc } from "@tauri-apps/api/tauri";

interface Props {
  path: string;
  active: boolean;
}

const PhotoEditor: React.FC<Props> = ({ path, active }) => {
  const imgRef = useRef<HTMLImageElement>(null);

  return (
    <div className="h-full w-full bg-gray-900 text-white flex flex-col items-center justify-center">
      <div className={`${active ? '' : 'hidden'} p-8`}>
        <img ref={imgRef} src={convertFileSrc(path)} alt="" />
      </div>
    </div>
  );
};

export default PhotoEditor;
