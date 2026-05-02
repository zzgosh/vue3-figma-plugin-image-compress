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

interface ProcessedFile {
  blob: Blob
  fileName: string
  baselineSize: number
  outputSize: number
}

interface ExportResult {
  originalSize: number
  compressedSize: number
}

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

const getInitialFormat = (format: string) => (format === 'webp' ? 'png' : format)

const processFile = async (file: FileData, compressionLevel: CompressionLevel, disableSuffix: boolean): Promise<ProcessedFile> => {
  const initialFormat = getInitialFormat(file.format)
  const sourceBlob = new Blob([file.buffer], { type: `image/${initialFormat}` })
  const shouldAddSuffix = !disableSuffix

  const { baseName, extension } = getBaseNameAndExtension(file.fileName)
  const scaleStr = shouldAddSuffix ? `_${file.scale}` : ''
  const finalFileName = `${baseName}${scaleStr}${extension}`

  const baselineResult =
    file.format === 'webp' ? await compressionHandler(sourceBlob, 'webp', 'none', finalFileName, shouldAddSuffix) : null
  const baselineBlob = baselineResult?.blob ?? sourceBlob
  const baselineFileName = baselineResult?.fileName ?? finalFileName

  if (compressionLevel === 'none') {
    return {
      blob: baselineBlob,
      fileName: baselineFileName,
      baselineSize: baselineBlob.size,
      outputSize: baselineBlob.size
    }
  }

  const compressedResult = await compressionHandler(sourceBlob, file.format, compressionLevel, finalFileName, shouldAddSuffix)
  if (compressedResult.compressedSize > baselineBlob.size) {
    return {
      blob: baselineBlob,
      fileName: baselineFileName,
      baselineSize: baselineBlob.size,
      outputSize: baselineBlob.size
    }
  }

  return {
    blob: compressedResult.blob,
    fileName: compressedResult.fileName,
    baselineSize: baselineBlob.size,
    outputSize: compressedResult.compressedSize
  }
}

export const handleSingleFile = async (
  file: FileData,
  compressionLevel: CompressionLevel,
  disableSuffix: boolean
): Promise<ExportResult> => {
  const processedFile = await processFile(file, compressionLevel, disableSuffix)
  downloadFile(processedFile.blob, processedFile.fileName)

  return {
    originalSize: processedFile.baselineSize,
    compressedSize: processedFile.outputSize
  }
}

export const handleMultipleFiles = async (
  files: FileData[],
  compressionLevel: CompressionLevel,
  disableSuffix: boolean
): Promise<ExportResult> => {
  const limit = pLimit(3)
  let totalOriginalSize = 0
  let totalCompressedSize = 0

  const processedFiles = await Promise.all(
    files.map((file) =>
      limit(async () => {
        const processedFile = await processFile(file, compressionLevel, disableSuffix)

        totalOriginalSize += processedFile.baselineSize
        totalCompressedSize += processedFile.outputSize

        return { blob: processedFile.blob, fileName: processedFile.fileName }
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
