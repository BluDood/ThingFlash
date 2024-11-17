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
      checkSuperbirdTool: () => Promise<boolean>
      downloadSuperbirdTool: () => Promise<void>
      findCarThing: () => Promise<string>
      findDevice: () => Promise<string>
      checkDriver: () => Promise<boolean>
      installDriver: () => Promise<boolean>
      setImage: (provider: string, image: string) => Promise<void>
      getLocalImages: () => Promise<LocalImage[]>
      addLocalImage: () => Promise<void>
      deleteLocalImage: (name: string) => Promise<void>
      startFlash: () => Promise<void>
    }
  }
}
