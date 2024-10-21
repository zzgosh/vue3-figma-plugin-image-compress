import { compressionHandler } from './compressionHandler'
import { createZip } from './zipHandler'

interface FileData {
  buffer: ArrayBuffer
  fileName: string
  format: string
  scale: string
}

export const handleSingleFile = async (file: FileData, compressionLevel: string): Promise<void> => {
  let blob = new Blob([file.buffer], { type: `image/${file.format}` })
  let fileName = file.fileName

  if (compressionLevel !== 'none') {
    const result = await compressionHandler(blob, file.format, compressionLevel, fileName)
    blob = result.blob
    fileName = result.fileName.replace('.', `${file.scale !== '1x' ? '_' + file.scale : ''}.`)
  } else if (file.scale !== '1x') {
    fileName = fileName.replace('.', `_${file.scale}.`)
  }

  downloadFile(blob, fileName)
}

export const handleMultipleFiles = async (files: FileData[], compressionLevel: string): Promise<void> => {
  const processedFiles = await Promise.all(
    files.map(async (file) => {
      let blob = new Blob([file.buffer], { type: `image/${file.format}` })
      let fileName = file.fileName

      if (compressionLevel !== 'none') {
        const result = await compressionHandler(blob, file.format, compressionLevel, fileName)
        blob = result.blob
        fileName = result.fileName.replace('.', `${file.scale !== '1x' ? '_' + file.scale : ''}.`)
      } else if (file.scale !== '1x') {
        fileName = fileName.replace('.', `_${file.scale}.`)
      }

      return { blob, fileName }
    })
  )

  const zipBlob = await createZip(processedFiles)
  const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace('T', '_').slice(0, -5)
  const zipFileName = `exported_files_${timestamp}.zip`
  downloadFile(zipBlob, zipFileName)
}

const downloadFile = (blob: Blob, fileName: string): void => {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.click()
  URL.revokeObjectURL(url)
}
