import '@electron-toolkit/preload'

interface LocalImage {
  name: string
  date: string
  size: number
}

declare global {
  interface Window {
    api: {
      on: (
        channel: string,
        listener: (...args: unknown[]) => void
      ) => () => void
      checkTool: () => Promise<boolean>
      downloadTool: () => Promise<boolean>
      findCarThing: () => Promise<string>
      setImage: (provider: string, image: string) => Promise<void>
      getLocalImages: () => Promise<LocalImage[]>
      addLocalImage: () => Promise<void>
      deleteLocalImage: (name: string) => Promise<void>
      startFlash: () => Promise<void>
    }
  }
}
