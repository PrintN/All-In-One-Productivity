import React from "react";

interface ModalProps {
  isVisible: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function Modal({ isVisible, onClose, onConfirm }: ModalProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white p-4 rounded shadow-md text-black" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl mb-4">Confirm Delete</h2>
        <p>Are you sure you want to delete this file/directory?</p>
        <div className="mt-4 flex justify-end gap-2">
          <button className="px-4 py-2 bg-gray-300 rounded" onClick={onClose}>Cancel</button>
          <button className="px-4 py-2 bg-red-500 text-white rounded" onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  );
}