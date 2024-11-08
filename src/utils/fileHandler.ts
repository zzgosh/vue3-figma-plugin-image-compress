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

// 修改文件名处理逻辑
const getBaseNameAndExtension = (fileName: string) => {
  const lastDotIndex = fileName.lastIndexOf('.')
  if (lastDotIndex === -1) {
    return { baseName: fileName, extension: '' }
  }
  return {
    baseName: fileName.substring(0, lastDotIndex),
    extension: fileName.substring(lastDotIndex)
  }
}

export const handleSingleFile = async (
  file: FileData,
  compressionLevel: CompressionLevel,
  enableSuffix: boolean
): Promise<{ originalSize: number; compressedSize: number }> => {
  // 如果是 WebP 格式,先用 PNG 导出再转换
  const initialFormat = file.format === 'webp' ? 'png' : file.format
  let blob = new Blob([file.buffer], { type: `image/${initialFormat}` })
  const originalSize = blob.size

  // 先处理基本文件名（包含缩放后缀）
  const { baseName, extension } = getBaseNameAndExtension(file.fileName)
  const scaleStr = enableSuffix ? `_${file.scale}` : ''
  const finalFileName = `${baseName}${scaleStr}${extension}`

  if (compressionLevel !== 'none') {
    const result = await compressionHandler(blob, file.format, compressionLevel, finalFileName, enableSuffix)
    blob = result.blob
    downloadFile(blob, result.fileName)
    return { originalSize, compressedSize: result.compressedSize }
  } else {
    if (file.format === 'webp') {
      // 即使不压缩也需要转换格式
      const result = await compressionHandler(blob, 'webp', 'light', finalFileName, enableSuffix)
      blob = result.blob
      downloadFile(blob, result.fileName)
      return { originalSize, compressedSize: result.blob.size }
    }
    downloadFile(blob, finalFileName)
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
        const { baseName, extension } = getBaseNameAndExtension(file.fileName)
        const scaleStr = `_${file.scale}` // 多文件时总是添加缩放后缀
        const finalFileName = `${baseName}${scaleStr}${extension}`
        let fileName = finalFileName

        totalOriginalSize += blob.size

        if (compressionLevel !== 'none') {
          const result = await compressionHandler(blob, file.format, compressionLevel, finalFileName, true)
          blob = result.blob
          fileName = result.fileName
          totalCompressedSize += result.compressedSize
        } else {
          totalCompressedSize += blob.size
          fileName = finalFileName
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
