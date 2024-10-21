import { compressionHandler } from './compressionHandler'
import { createZip } from './zipHandler'

interface FileData {
  buffer: ArrayBuffer
  fileName: string
  format: string
  scale: string
}

export const handleSingleFile = async (file: FileData, compressionLevel: string): Promise<{ originalSize: number; compressedSize: number }> => {
  let blob = new Blob([file.buffer], { type: `image/${file.format}` })
  let fileName = file.fileName
  const originalSize = blob.size

  if (compressionLevel !== 'none') {
    const result = await compressionHandler(blob, file.format, compressionLevel, fileName)
    blob = result.blob
    fileName = result.fileName.replace('.', `${file.scale !== '1x' ? '_' + file.scale : ''}.`)
    downloadFile(blob, fileName)
    return { originalSize, compressedSize: result.compressedSize }
  } else {
    downloadFile(blob, fileName)
    return { originalSize, compressedSize: originalSize }
  }
}

export const handleMultipleFiles = async (files: FileData[], compressionLevel: string): Promise<{ originalSize: number; compressedSize: number }> => {
  let totalOriginalSize = 0
  let totalCompressedSize = 0

  const processedFiles = await Promise.all(
    files.map(async (file) => {
      let blob = new Blob([file.buffer], { type: `image/${file.format}` })
      let fileName = file.fileName
      totalOriginalSize += blob.size

      if (compressionLevel !== 'none') {
        const result = await compressionHandler(blob, file.format, compressionLevel, fileName)
        blob = result.blob
        fileName = result.fileName.replace('.', `${file.scale !== '1x' ? '_' + file.scale : ''}.`)
        totalCompressedSize += result.compressedSize
      } else {
        totalCompressedSize += blob.size
      }

      return { blob, fileName }
    })
  )

  const zipBlob = await createZip(processedFiles)
  const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace('T', '_').slice(0, -5)
  const zipFileName = `exported_files_${timestamp}.zip`
  downloadFile(zipBlob, zipFileName)

  return { originalSize: totalOriginalSize, compressedSize: totalCompressedSize }
}

const downloadFile = (blob: Blob, fileName: string): void => {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.click()
  URL.revokeObjectURL(url)
}
