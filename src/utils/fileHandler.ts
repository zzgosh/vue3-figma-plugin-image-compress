import { compressionHandler } from './compressionHandler'
import { createZip } from './zipHandler'
import { type CompressionLevel } from './constants'
import pLimit from 'p-limit'

interface FileData {
  buffer: ArrayBuffer
  fileName: string
  format: string
  scale: string
}

export const handleSingleFile = async (
  file: FileData,
  compressionLevel: CompressionLevel,
  enableSuffix: boolean
): Promise<{ originalSize: number; compressedSize: number }> => {
  let blob = new Blob([file.buffer], { type: `image/${file.format}` })
  const originalSize = blob.size

  // 先处理基本文件名（包含缩放后缀）
  const baseName = file.fileName.split('.')[0]
  const scaleStr = enableSuffix ? `_${file.scale}` : ''
  const extension = `.${file.format.toLowerCase()}`
  const baseFileName = `${baseName}${scaleStr}${extension}` // 包含缩放后缀的基本文件名

  if (compressionLevel !== 'none') {
    // 传入包含缩放后缀的文件名，而不是原始文件名
    const result = await compressionHandler(blob, file.format, compressionLevel, baseFileName, enableSuffix)
    blob = result.blob
    downloadFile(blob, result.fileName)
    return { originalSize, compressedSize: result.compressedSize }
  } else {
    downloadFile(blob, baseFileName)
    return { originalSize, compressedSize: originalSize }
  }
}

export const handleMultipleFiles = async (
  files: FileData[],
  compressionLevel: CompressionLevel
): Promise<{ originalSize: number; compressedSize: number }> => {
  const limit = pLimit(3) // 限制同时处理3个文件
  let totalOriginalSize = 0
  let totalCompressedSize = 0

  const processedFiles = await Promise.all(
    files.map((file) =>
      limit(async () => {
        let blob = new Blob([file.buffer], { type: `image/${file.format}` })
        // 先处理基本文件名（包含缩放后缀）
        const baseName = file.fileName.split('.')[0]
        const scaleStr = `_${file.scale}` // 多文件时总是添加缩放后缀
        const extension = `.${file.format.toLowerCase()}`
        const baseFileName = `${baseName}${scaleStr}${extension}`
        let fileName = baseFileName

        totalOriginalSize += blob.size

        if (compressionLevel !== 'none') {
          const result = await compressionHandler(blob, file.format, compressionLevel, baseFileName, true)
          blob = result.blob
          fileName = result.fileName
          totalCompressedSize += result.compressedSize
        } else {
          totalCompressedSize += blob.size
          fileName = baseFileName
        }

        return { blob, fileName }
      })
    )
  )

  const zipBlob = await createZip(processedFiles)
  const timestamp = new Date()
    .toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    })
    .replace(/\//g, '-')
    .replace(',', ' at')
  const zipFileName = `image_compressed_${timestamp}.zip`
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
