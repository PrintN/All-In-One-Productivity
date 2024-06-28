import React, { useState, useEffect } from 'react';
import { useExtensions } from '../context/ExtensionsContext';
import { invoke } from '@tauri-apps/api/tauri';
import { readDir, readTextFile } from '@tauri-apps/api/fs';
import { open } from '@tauri-apps/api/dialog'; // Import dialog module from Tauri

const Extensions: React.FC = () => {
    const [isValidExtension, setIsValidExtension] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [selectedDirectory, setSelectedDirectory] = useState<string>('');
    const { allExtensions, activatedExtensions, addExtension, activateExtension, deactivateExtension, removeExtension, setTsxCode } = useExtensions();

    useEffect(() => {
        // Initialize the local storage with an empty object if it doesn't exist
        if (!localStorage.getItem('selectedExtensionDirectories')) {
            localStorage.setItem('selectedExtensionDirectories', JSON.stringify({}));
        }
    }, []);

    const handleUpload = async () => {
        try {
            const result = await open({
                directory: true, // Allow selecting a directory
            });

            if (!result) return;

            const directoryPath = result as string; // Get the first selected directory
            console.log('Selected directory:', directoryPath);

            setSelectedDirectory(directoryPath); // Save the selected directory path to state

            // Read the directory contents
            const files = await readDir(directoryPath, { recursive: true });
            let hasJsonFile = false;
            let hasTsxFile = false;

            // Check if the directory contains at least one .json and one .tsx file
            let extension: ExtensionInfo | null = null;
            for (const file of files) {
                if (file.name && file.name.endsWith('.json')) {
                    hasJsonFile = true;
                    const jsonContent = await readTextFile(file.path);
                    extension = JSON.parse(jsonContent) as ExtensionInfo;
                    addExtension(extension); // Add extension info to the context
                }
                if (file.name && file.name.endsWith('.html')) {
                    hasTsxFile = true;
                }
            }

            if (hasJsonFile && hasTsxFile && extension) {
                setIsValidExtension(true);
                setErrorMessage('');

                const directoryName = directoryPath.split(/[\\/]/).pop(); // Get the last segment after splitting by slashes or backslashes

                // Retrieve existing object of extension names and directory names from local storage
                const selectedExtensionDirectories = JSON.parse(localStorage.getItem('selectedExtensionDirectories') || '{}');
                // Add new entry with extension name as key and directory name as value
                selectedExtensionDirectories[extension.name] = directoryName;
                // Update local storage with the modified object
                localStorage.setItem('selectedExtensionDirectories', JSON.stringify(selectedExtensionDirectories));

                // Invoke Rust command to move extension folder
                const moveResult = await invoke<string>('move_extension', { directoryPath });
                console.log('Extension move result:', moveResult);
            } else {
                setIsValidExtension(false);
                setErrorMessage('The directory must contain at least one JSON file and one TSX file.');
            }
        } catch (error) {
            setIsValidExtension(false);
            setErrorMessage('Error processing directory. Please try again.');
            console.error('Error handling directory upload:', error);
        }
    };

    const handleToggleExtension = (extension: ExtensionInfo) => {
        const activatedExtension = activatedExtensions.find(ext => ext.name === extension.name);
        if (activatedExtension) {
            deactivateExtension(extension.name);
        } else {
            activateExtension(extension);
        }
    };

    const handleRemoveExtension = async (extension: ExtensionInfo) => {
        try {
            // Retrieve object of extension names and directory names from local storage
            const selectedExtensionDirectories = JSON.parse(localStorage.getItem('selectedExtensionDirectories') || '{}');

            if (!Object.keys(selectedExtensionDirectories).length) {
                throw new Error('No extension directory names found in local storage.');
            }

            // Find directory name using extension name
            const directoryToRemove = selectedExtensionDirectories[extension.name];

            if (!directoryToRemove) {
                throw new Error(`No directory found for extension ${extension.name} in local storage.`);
            }

            // Invoke Rust command to remove extension folder
            const result = await invoke<string>('remove_extension_folder', {
                directoryName: directoryToRemove
            });
            console.log('Extension removal result:', result);
            // Remove extension from context
            removeExtension(extension.name);

            // Remove entry from object in local storage
            delete selectedExtensionDirectories[extension.name];
            localStorage.setItem('selectedExtensionDirectories', JSON.stringify(selectedExtensionDirectories));
        } catch (error) {
            console.error('Error removing extension:', error);
        }
    };

    return (
        <div className="h-full w-full bg-gray-900 text-white flex flex-col items-center justify-center">
            <h1 className="text-4xl mb-6">Extensions</h1>
            <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                onClick={handleUpload}
            >
                Upload Plugin
            </button>
            {selectedDirectory && (
                <p className="mt-4 text-lg">Selected Directory: {selectedDirectory}</p>
            )}
            {!isValidExtension && errorMessage && (
                <div className="mt-8 text-red-500">{errorMessage}</div>
            )}
            {isValidExtension && (
                <div className="mt-8">
                    <h2 className="text-xl">Extension Uploaded Successfully!</h2>
                </div>
            )}
            <div className="mt-8">
                <h2 className="text-xl">All Extensions:</h2>
                {allExtensions.map(ext => (
                    <div key={ext.name} className="mb-2">
                        <div>Name: {ext.name}</div>
                        <div>Description: {ext.description}</div>
                        <div>Author: {ext.author}</div>
                        <div>Creation Date: {ext.creationDate}</div>
                        <div>Version: {ext.version}</div>
                        <div>Icon: <i className={`${ext.iconClass} text-gray-300 w-6 h-6`}></i></div>
                        <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mt-2" onClick={() => handleToggleExtension(ext)}>
                            {activatedExtensions.some(activeExt => activeExt.name === ext.name) ? 'Deactivate' : 'Activate'}
                        </button>
                        <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded ml-2" onClick={() => handleRemoveExtension(ext)}>
                            Remove
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Extensions;

export interface ExtensionInfo {
    name: string;
    description: string;
    author: string;
    creationDate: string;
    version: string;
    iconClass: string;
}