export interface IFile {
  id: string;
  name: string;
  kind: 'file' | 'directory';
  path: string; 
  modified: boolean;  // New property to track if the file is modified
}