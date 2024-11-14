import '@electron-toolkit/preload'

import { contextBridge, ipcRenderer } from 'electron'

enum IPCHandler {
  CheckTool = 'checkTool',
  DownloadTool = 'downloadTool',
  FindCarThing = 'findCarThing',
  SetImage = 'setImage',
  GetLocalImages = 'getLocalImages',
  AddLocalImage = 'addLocalImage',
  DeleteLocalImage = 'deleteLocalImage',
  StartFlash = 'startFlash'
}

// Custom APIs for renderer
const api = {
  on: (channel: string, listener: (...args: unknown[]) => void) => {
    const _listener = (_event, ...args: unknown[]) => listener(...args)
    ipcRenderer.on(channel, _listener)

    return () => ipcRenderer.removeListener(channel, _listener)
  },
  checkTool: () => ipcRenderer.invoke(IPCHandler.CheckTool),
  downloadTool: () => ipcRenderer.invoke(IPCHandler.DownloadTool),
  findCarThing: () => ipcRenderer.invoke(IPCHandler.FindCarThing),
  setImage: (provider: string, image: string) =>
    ipcRenderer.invoke(IPCHandler.SetImage, provider, image),
  getLocalImages: () => ipcRenderer.invoke(IPCHandler.GetLocalImages),
  addLocalImage: () => ipcRenderer.invoke(IPCHandler.AddLocalImage),
  deleteLocalImage: (name: string) =>
    ipcRenderer.invoke(IPCHandler.DeleteLocalImage, name),
  startFlash: () => ipcRenderer.invoke(IPCHandler.StartFlash)
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.api = api
}
