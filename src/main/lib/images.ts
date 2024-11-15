import { app, dialog } from 'electron'
import axios from 'axios'
import path from 'path'
import fs from 'fs'

import { execAsync, log, LogLevel } from './utils.js'

const current = {
  provider: '',
  image: ''
}

export function getCurrentProvider() {
  return current.provider
}

export async function setCurrentImage(provider: string, image: string) {
  log(`Setting current image to ${provider}/${image}`, 'images')
  current.provider = provider
  current.image = image
}

export async function getCurrentImagePath() {
  if (current.provider === 'thingify') {
    const path = await getThingifyImagePath()
    return path
  } else if (current.provider === 'local') {
    const path = await getLocalImagePath()
    return path
  }

  return null
}

export async function cleanupImages() {
  log('Cleaning up images', 'images')
  const tempPath = path.join(app.getPath('temp'), 'thingflash-images')
  if (fs.existsSync(tempPath)) fs.rmSync(tempPath, { recursive: true })
}

async function getThingifyImagePath() {
  log('Getting Thingify image', 'images')
  const res = await axios.get(
    `https://thingify.tools/api/v1/version/${current.image}`
  )
  if (res.status !== 200)
    return log('Failed to get image', 'images', LogLevel.ERROR)

  const file = res.data.files[0]

  const nameWithoutExt = file.fileName.split('.').slice(0, -1).join('.')

  const extractPath = path.join(
    app.getPath('temp'),
    'thingflash-images',
    nameWithoutExt
  )

  if (fs.existsSync(extractPath)) {
    log(`Image ${nameWithoutExt} already downloaded`, 'images')
    return extractPath
  }

  log(`Downloading image ${nameWithoutExt}`, 'images')

  const download = await axios.get(file.downloadUrl, {
    responseType: 'stream'
  })

  const tempPath = path.join(app.getPath('temp'), file.fileName)

  const writer = fs.createWriteStream(tempPath)

  download.data.pipe(writer)

  await new Promise((resolve, reject) => {
    writer.on('finish', resolve)
    writer.on('error', reject)
  })

  log(`Downloaded ${nameWithoutExt}, extracting image`, 'images')

  fs.mkdirSync(extractPath, { recursive: true })

  await execAsync(`tar -xf "${tempPath}" -C "${extractPath}"`)

  fs.rmSync(tempPath)

  log(`Extracted ${nameWithoutExt} and cleaned up`, 'images')

  return extractPath
}

export async function getLocalImages() {
  log('Getting local images', 'images')
  const localImagesPath = path.join(app.getPath('userData'), 'localImages')

  if (!fs.existsSync(localImagesPath))
    fs.mkdirSync(localImagesPath, { recursive: true })

  const files = fs.readdirSync(localImagesPath)

  log(`Found ${files.length} local images`, 'images')

  return files.map(file => {
    const stats = fs.statSync(path.join(localImagesPath, file))

    return {
      name: file,
      size: stats.size,
      date: stats.mtime
    }
  })
}

export async function addLocalImage() {
  log('Adding local image', 'images')
  const { filePaths } = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [
      { name: 'CarThing Images', extensions: ['zip', 'tar.gz', 'tar.xz'] }
    ]
  })

  if (!filePaths || !filePaths.length)
    return log('No file selected', 'images', LogLevel.WARN)

  const imagePath = filePaths[0]

  const targetPath = path.join(
    app.getPath('userData'),
    'localImages',
    path.basename(imagePath)
  )

  fs.copyFileSync(imagePath, targetPath)

  log(`Copied ${imagePath} to ${targetPath}`, 'images')

  return targetPath
}

export async function deleteLocalImage(name: string) {
  const imagePath = path.join(app.getPath('userData'), 'localImages', name)
  if (fs.existsSync(imagePath)) {
    fs.rmSync(imagePath)
    log(`Deleted local image ${name}`, 'images')
  } else {
    log(`Local image ${name} not found`, 'images', LogLevel.ERROR)
  }
}

async function getLocalImagePath() {
  log('Getting local image', 'images')
  const name = path.basename(current.image)
  const nameWithoutExt = name.split('.').slice(0, -1).join('.')

  const imagePath = path.join(
    app.getPath('userData'),
    'localImages',
    name
  )

  if (!fs.existsSync(imagePath))
    return log(`Local image ${name} not found`, 'images', LogLevel.ERROR)

  log(`Extracting local image ${nameWithoutExt}`, 'images')

  const extractPath = path.join(
    app.getPath('temp'),
    'thingflash-images',
    nameWithoutExt
  )

  fs.mkdirSync(extractPath, { recursive: true })

  await execAsync(`tar -xf "${imagePath}" -C "${extractPath}"`)

  log(`Extracted local image ${nameWithoutExt}`, 'images')

  return extractPath
}
