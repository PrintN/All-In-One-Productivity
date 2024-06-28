import { IFile } from "."

const entries: IEntries = {}

export const saveFileObject = (id: string, file: IFile): void => {
  entries[id] = file
}

export const getFileObject = (id: string): IFile => {
  return entries[id]
}

interface IEntries {
  [key: string]: IFile
}