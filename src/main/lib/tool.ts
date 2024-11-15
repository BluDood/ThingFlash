import { spawn } from 'child_process'
import { app } from 'electron'
import axios from 'axios'
import path from 'path'
import fs from 'fs'

import { execAsync, log } from './utils.js'

const platforms = {
  darwin: {
    name: 'macos',
    exec: 'superbird-tool'
  },
  win32: {
    name: 'windows',
    exec: 'superbird-tool.exe'
  },
  linux: {
    name: 'linux',
    exec: 'superbird-tool'
  }
}

const platform = platforms[process.platform]

const url = `https://github.com/BluDood/superbird-tool/releases/download/beta-85e6ef1/superbird-tool-${platform.name}.zip`

export async function checkTool() {
  const userDataPath = app.getPath('userData')
  const toolFolderPath = path.join(userDataPath, 'superbird-tool')
  const toolPath = path.join(toolFolderPath, platform.exec)

  const exists = fs.existsSync(toolPath)

  return exists
}

export async function downloadTool() {
  log('Downloading...', 'superbird-tool')
  const userDataPath = app.getPath('userData')
  const toolFolderPath = path.join(userDataPath, 'superbird-tool')

  if (fs.existsSync(toolFolderPath))
    fs.rmSync(toolFolderPath, { recursive: true })

  const downloadPath = path.join(app.getPath('temp'), 'superbird-tool.zip')

  const download = await axios.get(url, {
    responseType: 'stream',
    validateStatus: () => true
  })

  const writer = fs.createWriteStream(downloadPath)

  download.data.pipe(writer)

  await new Promise((resolve, reject) => {
    writer.on('finish', resolve)
    writer.on('error', reject)
  })

  log('Downloaded, extracting...', 'superbird-tool')

  fs.mkdirSync(toolFolderPath)

  await execAsync(`tar -xf "${downloadPath}" -C "${toolFolderPath}"`)

  fs.rmSync(downloadPath)

  log('Extracted and cleaned up', 'superbird-tool')

  return true
}

export async function runTool(args: string) {
  const toolPath = path.join(
    app.getPath('userData'),
    'superbird-tool',
    platform.exec
  )

  log(`Running tool with args: ${args}`, 'superbird-tool')

  const res = await execAsync(`"${toolPath}" ${args}`)

  return res
}

export function spawnTool(args: string) {
  const toolPath = path.join(
    app.getPath('userData'),
    'superbird-tool',
    platform.exec
  )

  log(`Spawning tool with args: ${args}`, 'superbird-tool')

  const cmd = spawn(`"${toolPath}" ${args}`, { shell: true })

  return cmd
}
