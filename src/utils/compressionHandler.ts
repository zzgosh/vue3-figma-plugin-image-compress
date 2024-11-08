import imageCompression from 'browser-image-compression'
import { compressionSuffixMap, type CompressionLevel } from './constants'

// 自定义错误类
class CompressionError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'CompressionError'
  }
}

export const compressionHandler = async (
  blob: Blob,
  format: string,
  compressionLevel: CompressionLevel,
  originalFileName: string,
  enableSuffix: boolean = false
): Promise<{ blob: Blob; fileName: string; compressedSize: number }> => {
  // 参数验证
  if (!blob) throw new CompressionError('Image blob is required')
  if (!format) throw new CompressionError('Image format is required')
  if (!originalFileName) throw new CompressionError('File name is required')

  const originalSize = blob.size
  const isJPEG = format.toLowerCase() === 'jpeg' || format.toLowerCase() === 'jpg'
  const isWebP = format.toLowerCase() === 'webp'
  let originalImage: ImageBitmap | null = null
  let compressedFile: File | null = null

  try {
    // 获取压缩配置选项
    const options = await getCompressionOptions(compressionLevel, originalSize, isJPEG, format)

    // 将 Blob 转换为 File 对象
    const blobFile = new File([blob], originalFileName, { type: blob.type })

    // 获取原始图像尺寸
    try {
      originalImage = await createImageBitmap(blobFile)
      options.maxWidthOrHeight = Math.max(originalImage.width, originalImage.height)
    } catch (error) {
      throw new CompressionError('Failed to read image dimensions')
    }

    // 执行压缩
    try {
      compressedFile = await imageCompression(blobFile, options)
    } catch (error) {
      throw new CompressionError(`Compression failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    // 转换为指定格式的 Blob
    const compressedBlob = new Blob([await compressedFile.arrayBuffer()], {
      type: `image/${format}`
    })

    // 压缩效果验证
    if (compressedBlob.size > originalSize) {
      console.warn('Compressed size is larger than original, returning original file')
      return {
        blob: blob,
        fileName: originalFileName,
        compressedSize: originalSize
      }
    }

    // 生成文件名
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

    const { baseName } = getBaseNameAndExtension(originalFileName)
    const compressionSuffix = compressionLevel !== 'none' && enableSuffix ? `${compressionSuffixMap[compressionLevel]}_compressed` : ''
    const fileName = `${baseName}${compressionSuffix}.${format}`

    return {
      blob: compressedBlob,
      fileName: fileName,
      compressedSize: compressedBlob.size
    }
  } catch (error) {
    // 统一错误处理
    if (error instanceof CompressionError) {
      throw error
    }
    throw new CompressionError(`Unexpected error during compression: ${error instanceof Error ? error.message : 'Unknown error'}`)
  } finally {
    // 资源清理
    if (originalImage) {
      originalImage.close()
    }
    // 手动触发垃圾回收建议
    if (compressedFile) {
      compressedFile = null
    }
  }
}

const getCompressionOptions = async (level: string, originalSize: number, isJPEG: boolean, format: string) => {
  // WebP 和 PNG 使用不同的优化策略
  if (!isJPEG) {
    let quality: number

    if (format.toLowerCase() === 'webp') {
      // WebP 格式压缩策略
      switch (level) {
        case 'light':
          quality = 0.85
          break
        case 'medium':
          quality = 0.75
          break
        case 'extreme':
          quality = 0.65
          break
        default:
          quality = 0.75
      }
    } else {
      // PNG 格式压缩策略
      switch (level) {
        case 'light':
          quality = 0.9
          break
        case 'medium':
          quality = 0.8
          break
        case 'extreme':
          quality = 0.7
          break
        default:
          quality = 0.8
      }
    }

    return {
      useWebWorker: true,
      maxWidthOrHeight: Infinity,
      initialQuality: quality,
      alwaysKeepResolution: true,
      fileType: format.toLowerCase() === 'webp' ? 'image/webp' : 'image/png'
    }
  }

  // JPEG 处理逻辑
  const sizeMB = originalSize / (1024 * 1024)
  let quality: number
  let targetSizeMB: number

  if (sizeMB < 0.01) {
    quality = 0.95
    targetSizeMB = sizeMB * 0.95
  } else if (sizeMB < 0.05) {
    quality = 0.92
    targetSizeMB = sizeMB * 0.9
  } else if (sizeMB < 0.1) {
    quality = 0.9
    targetSizeMB = sizeMB * 0.85
  } else if (sizeMB < 0.3) {
    quality = 0.88
    targetSizeMB = sizeMB * 0.8
  } else if (sizeMB < 0.5) {
    quality = 0.85
    targetSizeMB = sizeMB * 0.75
  } else if (sizeMB < 1.0) {
    quality = 0.82
    targetSizeMB = sizeMB * 0.7
  } else if (sizeMB < 2.0) {
    quality = 0.8
    targetSizeMB = sizeMB * 0.65
  } else {
    quality = 0.7
    targetSizeMB = sizeMB * 0.6
  }

  // 根据压缩级别调整
  switch (level) {
    case 'light':
      quality += 0.05
      targetSizeMB *= 1.15
      break
    case 'extreme':
      quality -= 0.1
      targetSizeMB *= 0.9
      break
  }

  return {
    maxSizeMB: targetSizeMB,
    useWebWorker: true,
    maxWidthOrHeight: Infinity,
    initialQuality: quality,
    alwaysKeepResolution: true,
    fileType: 'image/jpeg',
    exifOrientation: 2
  }
}
