import { exec, ExecOptions } from 'child_process'
import { app } from 'electron'
import path from 'path'
import fs from 'fs'

export async function execAsync(
  cmd: string,
  options?: ExecOptions
): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(cmd, options, (error, stdout) => {
      if (error) {
        reject(error)
      } else {
        resolve(stdout.toString())
      }
    })
  })
}

let logPath: string | null = null

export enum LogLevel {
  DEBUG,
  INFO,
  WARN,
  ERROR
}

const logLevelNames = ['DEBUG', 'INFO', 'WARN', 'ERROR']

const logLevel = LogLevel.DEBUG

export function log(text: string, scope?: string, level = LogLevel.INFO) {
  if (level < logLevel) return

  if (!logPath)
    logPath = path.join(app.getPath('userData'), 'thingflash.log')

  const time = new Date().toLocaleTimeString([], {
    hour12: false,
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric'
  })

  const levelName = logLevelNames[level]

  const log = `[${time}] ${levelName}${scope ? ` <${scope}>:` : ''} ${text}`

  console.log(log)
  fs.appendFileSync(logPath, log + '\n')
}

const unzipCommands = {
  darwin: (src: string, dst: string) =>
    execAsync(`unzip -o "${src}" -d "${dst}"`),
  win32: (src: string, dst: string) =>
    execAsync(`tar -xf "${src}" -C "${dst}"`),
  linux: (src: string, dst: string) =>
    execAsync(`unzip -o "${src}" -d "${dst}"`)
}

export async function unzip(zipPath: string, destPath: string) {
  const cmd = unzipCommands[process.platform]
  if (!cmd) throw new Error('Unsupported platform')

  return cmd(zipPath, destPath)
}
