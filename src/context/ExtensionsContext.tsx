import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface ExtensionInfo {
  name: string;
  description: string;
  author: string;
  creationDate: string;
  version: string;
  iconClass: string;
}

interface ActivatedExtension extends ExtensionInfo {
  isActive: boolean;
  key: string;
}

interface ExtensionsContextType {
  allExtensions: ExtensionInfo[];
  activatedExtensions: ActivatedExtension[];
  addExtension: (extension: ExtensionInfo) => void;
  activateExtension: (extension: ExtensionInfo) => void;
  deactivateExtension: (extensionName: string) => void;
  removeExtension: (extensionName: string) => void;
  tsxCode: string;
  setTsxCode: (code: string) => void;
}

const ExtensionsContext = createContext<ExtensionsContextType | undefined>(undefined);

export const useExtensions = () => {
  const context = useContext(ExtensionsContext);
  if (!context) {
    throw new Error('useExtensions must be used within an ExtensionsProvider');
  }
  return context;
};

interface ExtensionsProviderProps {
  children: ReactNode; // Define children prop as ReactNode
}

export const ExtensionsProvider: React.FC<ExtensionsProviderProps> = ({ children }) => {
  const [allExtensions, setAllExtensions] = useState<ExtensionInfo[]>([]);
  const [activatedExtensions, setActivatedExtensions] = useState<ActivatedExtension[]>([]);
  const [tsxCode, setTsxCode] = useState<string>('');

  useEffect(() => {
    const storedAllExtensions = localStorage.getItem('allExtensions');
    const storedActivatedExtensions = localStorage.getItem('activatedExtensions');
    if (storedAllExtensions) {
      setAllExtensions(JSON.parse(storedAllExtensions));
    }
    if (storedActivatedExtensions) {
      setActivatedExtensions(JSON.parse(storedActivatedExtensions));
    }
  }, []);

  const addExtension = (extension: ExtensionInfo) => {
    const updatedAllExtensions = [...allExtensions, extension];
    setAllExtensions(updatedAllExtensions);
    localStorage.setItem('allExtensions', JSON.stringify(updatedAllExtensions));
  };

  const activateExtension = (extension: ExtensionInfo) => {
    if (!activatedExtensions.some(ext => ext.name === extension.name)) {
      const newActivatedExtension: ActivatedExtension = {
        ...extension,
        isActive: true,
        key: uuidv4(),
      };
      const updatedActivatedExtensions = [...activatedExtensions, newActivatedExtension];
      setActivatedExtensions(updatedActivatedExtensions);
      localStorage.setItem('activatedExtensions', JSON.stringify(updatedActivatedExtensions));
    }
  };

  const deactivateExtension = (extensionName: string) => {
    const updatedActivatedExtensions = activatedExtensions.filter(ext => ext.name !== extensionName);
    setActivatedExtensions(updatedActivatedExtensions);
    localStorage.setItem('activatedExtensions', JSON.stringify(updatedActivatedExtensions));
  };

  const removeExtension = (extensionName: string) => {
    setActivatedExtensions(prev =>
      prev.filter(ext => ext.name !== extensionName)
    );
    setAllExtensions(prev =>
      prev.filter(ext => ext.name !== extensionName)
    );
    localStorage.setItem('allExtensions', JSON.stringify(allExtensions.filter(ext => ext.name !== extensionName)));
    localStorage.setItem('activatedExtensions', JSON.stringify(activatedExtensions.filter(ext => ext.name !== extensionName)));
  };

  return (
    <ExtensionsContext.Provider value={{ allExtensions, activatedExtensions, addExtension, activateExtension, deactivateExtension, removeExtension, tsxCode, setTsxCode }}>
      {children}
    </ExtensionsContext.Provider>
  );
};