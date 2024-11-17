import { app } from 'electron'
import axios from 'axios'
import path from 'path'
import fs from 'fs'

import { execAsync, log } from './utils.js'

const url = `https://github.com/BluDood/libwdi_tool/releases/download/beta-88b1d6d/libwdi_tool.exe`

export async function checkTool() {
  const toolPath = path.join(app.getPath('userData'), 'libwdi_tool.exe')

  const exists = fs.existsSync(toolPath)

  return exists
}

export async function downloadTool() {
  log('Downloading...', 'libwdi-tool')

  const toolPath = path.join(app.getPath('userData'), 'libwdi_tool.exe')

  if (fs.existsSync(toolPath)) fs.rmSync(toolPath)

  const download = await axios.get(url, {
    responseType: 'stream',
    validateStatus: () => true
  })

  const writer = fs.createWriteStream(toolPath)

  download.data.pipe(writer)

  await new Promise((resolve, reject) => {
    writer.on('finish', resolve)
    writer.on('error', reject)
  })

  log('Downloaded!', 'libwdi-tool')

  return true
}

export async function runTool(args: string) {
  if (!(await checkTool())) await downloadTool()
  const toolPath = path.join(app.getPath('userData'), 'libwdi_tool.exe')

  log(`Running with args: ${args}`, 'libwdi-tool')

  const res = await execAsync(`"${toolPath}" ${args}`)

  return res
}

export async function runToolAdmin(args: string) {
  if (!(await checkTool())) await downloadTool()
  const toolPath = path.join(app.getPath('userData'), 'libwdi_tool.exe')

  log(`Running as admin with args: ${args}`, 'libwdi-tool')

  const res = await execAsync(
    `Start-Process ${toolPath} -Verb runAs -Wait -WindowStyle Hidden -ArgumentList "${args}"`,
    {
      shell: 'powershell.exe'
    }
  )

  return res
}

const libwdi = {
  checkTool,
  downloadTool,
  runTool,
  runToolAdmin
}

export default libwdi
