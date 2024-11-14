import React, { useEffect, useState } from 'react'
import axios from 'axios'

import Loader from '@/components/Loader/Loader.js'

import {
  formatNumber,
  formatRelativeDate,
  formatSize
} from '@/lib/utils.js'

import styles from './SelectImage.module.css'

interface SelectImageProps {
  onStepComplete: () => void
}

const SelectImage: React.FC<SelectImageProps> = ({ onStepComplete }) => {
  const [provider, setProvider] = useState('thingify')

  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [selectedVersion, setSelectedVersion] = useState<string | null>(
    null
  )

  const [localImage, setLocalImage] = useState<string | null>(null)

  async function handleAddImage(e: React.MouseEvent<HTMLButtonElement>) {
    e.stopPropagation()

    await window.api.addLocalImage()

    setProvider('')
    setTimeout(() => {
      setProvider('local')
    }, 0)
  }

  async function handleContinue() {
    if (provider === 'thingify' && selectedVersion) {
      await window.api.setImage(provider, selectedVersion)
    } else if (provider === 'local' && localImage) {
      await window.api.setImage(provider, localImage)
    }

    onStepComplete()
  }

  useEffect(() => {
    if (selectedVersion && localImage) {
      if (provider === 'thingify') {
        setLocalImage(null)
      } else if (provider === 'local') {
        setSelectedImage(null)
        setSelectedVersion(null)
      }
    }
  }, [provider, selectedVersion, localImage])

  return (
    <div className={styles.selectImage}>
      <p className={styles.step}>Step 2</p>
      <h1>Select Image</h1>
      <p>Here you can choose which image to flash the CarThing with.</p>
      <div className={styles.picker}>
        <div className={styles.providers}>
          <div
            className={styles.provider}
            onClick={() => setProvider('thingify')}
            data-active={provider === 'thingify'}
          >
            <p>Thingify</p>
          </div>
          <div
            className={styles.provider}
            onClick={() => setProvider('local')}
            data-active={provider === 'local'}
          >
            <p>Local Images</p>
            <button onClick={handleAddImage}>
              <span className="material-icons">add</span>
            </button>
          </div>
        </div>
        {provider === 'thingify' ? (
          <ThingifyImages
            selectedImage={selectedImage}
            setSelectedImage={setSelectedImage}
            selectedVersion={selectedVersion}
            setSelectedVersion={setSelectedVersion}
          />
        ) : provider === 'local' ? (
          <LocalImages
            localImage={localImage}
            setLocalImage={setLocalImage}
          />
        ) : null}
      </div>
      {selectedVersion || localImage ? (
        <div className={styles.buttons}>
          <button onClick={handleContinue}>Continue</button>
        </div>
      ) : null}
    </div>
  )
}

interface ThingifyImage {
  id: string
  name: string
  description: string
  totalDownloads: number
}

interface ThingifyImageVersion {
  id: string
  version: string
  downloadCount: number
  createdAt: number
}

interface ThingifyImagesProps {
  selectedImage: string | null
  setSelectedImage: (image: string) => void
  selectedVersion: string | null
  setSelectedVersion: (version: string) => void
}

const ThingifyImages: React.FC<ThingifyImagesProps> = ({
  selectedImage,
  setSelectedImage,
  selectedVersion,
  setSelectedVersion
}) => {
  const [images, setImages] = useState<ThingifyImage[] | null>(null)
  const [versions, setVersions] = useState<ThingifyImageVersion[] | null>(
    null
  )

  async function fetchImages() {
    setImages(null)

    const res = await axios.get('https://thingify.tools/api/v1/firmware')
    const filter = ['Thing Labs', 'Spotify']

    setImages(
      res.data.filter((image: ThingifyImage) =>
        filter.includes(image.name)
      )
    )
  }

  async function fetchVersions(imageId: string) {
    setVersions(null)

    const res = await axios.get(
      `https://thingify.tools/api/v1/firmware/${imageId}`
    )

    setVersions(res.data.versions)
  }

  useEffect(() => {
    fetchImages()
  }, [])

  useEffect(() => {
    if (selectedImage) fetchVersions(selectedImage)
  }, [selectedImage])

  return (
    <div className={styles.thingify}>
      {images ? (
        <div className={styles.images} key="images">
          {images
            .sort((a, b) => b.totalDownloads - a.totalDownloads)
            .map(image => (
              <button
                className={styles.image}
                key={image.name}
                onClick={() => setSelectedImage(image.id)}
                data-active={selectedImage === image.id}
              >
                <h2 className={styles.name}>
                  {image.name}
                  <p className={styles.downloads}>
                    <span className="material-icons">cloud_download</span>
                    {formatNumber(image.totalDownloads)}
                  </p>
                </h2>
                <p className={styles.description}>
                  {image.description.split('\r\n\r\n')[0]}
                </p>
              </button>
            ))}
        </div>
      ) : (
        <div className={styles.loading}>
          <Loader />
        </div>
      )}
      {versions ? (
        <div className={styles.versions} key={selectedImage}>
          {versions
            .sort((a, b) => a.createdAt - b.createdAt)
            .reverse()
            .map((version, i) => (
              <button
                className={styles.version}
                key={version.version}
                onClick={() => {
                  setSelectedVersion(version.id)
                }}
                data-active={selectedVersion === version.id}
              >
                <h2>
                  {version.version}
                  <div className={styles.tags}>
                    {i === 0 ? (
                      <span className={styles.tag} data-tag={'latest'}>
                        latest
                      </span>
                    ) : null}
                  </div>
                </h2>
                <div className={styles.info}>
                  <p>
                    <span className="material-icons">cloud_download</span>
                    {formatNumber(version.downloadCount)}
                  </p>
                  <p>
                    <span className="material-icons">calendar_today</span>
                    {formatRelativeDate(new Date(version.createdAt))}
                  </p>
                </div>
              </button>
            ))}
        </div>
      ) : selectedImage ? (
        <div className={styles.loading}>
          <Loader />
        </div>
      ) : null}
    </div>
  )
}

interface LocalImage {
  name: string
  date: string
  size: number
}

interface LocalImagesProps {
  localImage: string | null
  setLocalImage: (image: string) => void
}

const LocalImages: React.FC<LocalImagesProps> = ({
  localImage,
  setLocalImage
}) => {
  const [images, setImages] = useState<LocalImage[] | null>(null)

  const reloadImages = () =>
    window.api.getLocalImages().then(images => {
      setImages(images as LocalImage[])
    })

  useEffect(() => {
    reloadImages()
  }, [])

  return images ? (
    <div className={styles.localImages} key="images">
      {images.map(image => (
        <button
          className={styles.image}
          key={image.name}
          onClick={() => setLocalImage(image.name)}
          data-active={localImage === image.name}
        >
          <h2 className={styles.name}>{image.name}</h2>
          <div className={styles.info}>
            <p>
              <span className="material-icons">storage</span>
              {formatSize(image.size)}
            </p>
            <p>
              <span className="material-icons">calendar_today</span>
              {formatRelativeDate(new Date(image.date))}
            </p>
          </div>
          <div className={styles.actions}>
            <button
              onClick={e => {
                e.stopPropagation()
                window.api.deleteLocalImage(image.name).then(reloadImages)
              }}
              data-type="delete"
            >
              <span className="material-icons">delete</span>
            </button>
          </div>
        </button>
      ))}
    </div>
  ) : (
    <div className={styles.loading} key="loading">
      <Loader />
    </div>
  )
}

export default SelectImage
