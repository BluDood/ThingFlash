import { app, shell, BrowserWindow, ipcMain } from 'electron'

import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { join } from 'path'

import { checkTool, downloadTool, runTool, spawnTool } from './lib/tool.js'
import {
  addLocalImage,
  cleanupImages,
  deleteLocalImage,
  getCurrentImagePath,
  getCurrentProvider,
  getLocalImages,
  setCurrentImage
} from './lib/images.js'

import icon from '../../resources/icon.png?asset'
import { log } from './lib/utils.js'

let mainWindow: BrowserWindow | null = null

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    },
    titleBarStyle: 'hidden',
    resizable: false,
    maximizable: false
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow!.show()
    mainWindow!.center()
    mainWindow?.setWindowButtonVisibility?.(false)
  })

  mainWindow.webContents.setWindowOpenHandler(details => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  mainWindow.webContents.session.webRequest.onHeadersReceived(
    { urls: ['https://thingify.tools/*'] },
    (details, callback) => {
      callback({
        responseHeaders: {
          'Access-Control-Allow-Origin': ['*'],
          ...details.responseHeaders
        }
      })
    }
  )

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.on('ready', async () => {
  log('Welcome!', 'ThingFlash')
  electronApp.setAppUserModelId('com.electron')

  await setupIpcHandlers()

  createWindow()
})

app.on('browser-window-created', (_, window) => {
  optimizer.watchWindowShortcuts(window)
})

app.on('activate', function () {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

let isQuitting = false
app.on('before-quit', async e => {
  if (isQuitting) return

  e.preventDefault()

  await cleanupImages()

  isQuitting = true
  app.quit()
})

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

async function setupIpcHandlers() {
  ipcMain.handle(IPCHandler.CheckTool, async () => {
    const res = await checkTool()
    return res
  })

  ipcMain.handle(IPCHandler.DownloadTool, async () => {
    const res = await downloadTool()
    return res
  })

  ipcMain.handle(IPCHandler.FindCarThing, async () => {
    const res = await runTool('--find_device')
    return res.includes('Found device booted in USB')
  })

  ipcMain.handle(
    IPCHandler.SetImage,
    async (_, provider: string, image: string) => {
      setCurrentImage(provider, image)
    }
  )

  ipcMain.handle(IPCHandler.GetLocalImages, async () => {
    const res = await getLocalImages()
    return res
  })

  ipcMain.handle(IPCHandler.AddLocalImage, async () => {
    const res = await addLocalImage()
    return res
  })

  ipcMain.handle(IPCHandler.DeleteLocalImage, async (_, name: string) => {
    await deleteLocalImage(name)
  })

  ipcMain.handle(IPCHandler.StartFlash, async () => {
    const sendStatus = ({ type, data }: { type: string; data: unknown }) =>
      mainWindow?.webContents.send('flashStatus', { type, data })

    sendStatus({
      type: 'status',
      data: 'flashing'
    })
    sendStatus({
      type: 'log',
      data: {
        id: 'burn',
        text: 'Entering burn mode...',
        status: 'pending'
      }
    })

    const burnRes = await runTool('--burn_mode').catch(() => null)

    if (!burnRes) {
      sendStatus({
        type: 'log',
        data: {
          id: 'burn',
          text: 'Failed to enter burn mode!',
          status: 'error'
        }
      })
      sendStatus({
        type: 'status',
        data: 'error'
      })
      return
    }

    if (burnRes.includes('Device is now in USB Burn Mode')) {
      sendStatus({
        type: 'log',
        data: {
          id: 'burn',
          text: 'Entered burn mode!',
          status: 'success'
        }
      })
    } else if (burnRes.includes('Device already in USB Burn Mode')) {
      sendStatus({
        type: 'log',
        data: {
          id: 'burn',
          text: 'Already in burn mode!',
          status: 'success'
        }
      })
    }

    const provider = getCurrentProvider()

    if (provider === 'thingify') {
      sendStatus({
        type: 'log',
        data: {
          id: 'download',
          text: 'Getting image from Thingify...',
          status: 'pending'
        }
      })
    } else if (provider === 'local') {
      sendStatus({
        type: 'log',
        data: {
          id: 'download',
          text: 'Extracting local image...',
          status: 'success'
        }
      })
    }

    const path = await getCurrentImagePath()

    if (!path) {
      sendStatus({
        type: 'log',
        data: {
          id: 'download',
          text: 'Failed to get image!',
          status: 'error'
        }
      })
      sendStatus({
        type: 'status',
        data: 'error'
      })
      return
    }

    if (provider === 'thingify') {
      sendStatus({
        type: 'log',
        data: {
          id: 'download',
          text: 'Got image from Thingify!',
          status: 'success'
        }
      })
    } else if (provider === 'local') {
      sendStatus({
        type: 'log',
        data: {
          id: 'download',
          text: 'Extracted local image!',
          status: 'success'
        }
      })
    }

    const cmd = spawnTool(`--restore_device ${path}`)

    let currentPartition = ''

    cmd.stdout.on('data', data => {
      const lines = data.toString().split('\n')
      for (const line of lines) {
        if (line.includes('writing partition:')) {
          const partition = line.match(/writing partition: "(.*)"/)?.[1]
          if (partition !== currentPartition) {
            if (currentPartition)
              sendStatus({
                type: 'log',
                data: {
                  id: currentPartition,
                  text: `Flashed partition "${currentPartition}"`,
                  status: 'success'
                }
              })
            sendStatus({
              type: 'log',
              data: {
                id: partition,
                text: `Flashing partition "${partition}"...`,
                status: 'pending'
              }
            })
            currentPartition = partition
          }
        } else if (line.includes('chunk_size:')) {
          const progress = line.match(/\| progress: ([0-9]+)% \|/)?.[1]
          sendStatus({
            type: 'log',
            data: {
              id: currentPartition,
              text: `Flashing partition "${currentPartition}"...`,
              status: 'pending',
              progress: parseInt(progress!)
            }
          })
        }
      }
    })

    cmd.on('close', async () => {
      sendStatus({
        type: 'log',
        data: {
          id: currentPartition,
          text: `Flashed partition "${currentPartition}"`,
          status: 'success'
        }
      })
      sendStatus({
        type: 'status',
        data: 'done'
      })
      sendStatus({
        type: 'log',
        data: {
          id: 'done',
          text: 'Flashing complete!',
          status: 'success'
        }
      })

      sendStatus({
        type: 'log',
        data: {
          id: 'reboot',
          text: 'Rebooting...',
          status: 'pending'
        }
      })
      await runTool('--continue_boot')
      sendStatus({
        type: 'log',
        data: {
          id: 'reboot',
          text: 'Rebooted!',
          status: 'success'
        }
      })
    })
  })
}
