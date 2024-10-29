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
  let originalImage: ImageBitmap | null = null
  let compressedFile: File | null = null

  try {
    // 获取压缩配置选项
    const options = await getCompressionOptions(compressionLevel, originalSize, isJPEG)

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
    const compressionSuffix = compressionLevel !== 'none' && enableSuffix ? `${compressionSuffixMap[compressionLevel]}_compressed` : ''
    const fileName = `${originalFileName.split('.')[0]}${compressionSuffix}.${format}`

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

const getCompressionOptions = async (level: string, originalSize: number, isJPEG: boolean) => {
  const sizeMB = originalSize / (1024 * 1024)
  let quality: number
  let targetSizeMB: number

  // 更新压缩参数策略
  const getTargetParams = (size: number, isJPEG: boolean): { quality: number; ratio: number } => {
    if (isJPEG) {
      // JPEG 使用更保守的压缩策略
      if (size < 0.01) return { quality: 0.95, ratio: 0.95 } // <10KB
      if (size < 0.05) return { quality: 0.92, ratio: 0.9 } // 10-50KB
      if (size < 0.1) return { quality: 0.9, ratio: 0.85 } // 50-100KB
      if (size < 0.3) return { quality: 0.88, ratio: 0.8 } // 100-300KB
      if (size < 0.5) return { quality: 0.85, ratio: 0.75 } // 300-500KB
      if (size < 1.0) return { quality: 0.82, ratio: 0.7 } // 500KB-1MB
      if (size < 2.0) return { quality: 0.8, ratio: 0.65 } // 1-2MB
      return { quality: 0.7, ratio: 0.6 } // >2MB
    } else {
      // PNG 使用更合理的压缩策略
      if (size < 0.01) return { quality: 0.95, ratio: 0.9 } // <10KB
      if (size < 0.05) return { quality: 0.9, ratio: 0.85 } // 10-50KB
      if (size < 0.1) return { quality: 0.85, ratio: 0.8 } // 50-100KB
      if (size < 0.3) return { quality: 0.8, ratio: 0.75 } // 100-300KB
      if (size < 0.5) return { quality: 0.75, ratio: 0.7 } // 300-500KB
      if (size < 1.0) return { quality: 0.7, ratio: 0.65 } // 500KB-1MB
      if (size < 2.0) return { quality: 0.65, ratio: 0.6 } // 1-2MB
      return { quality: 0.6, ratio: 0.55 } // >2MB
    }
  }

  const baseParams = getTargetParams(sizeMB, isJPEG)

  if (isJPEG) {
    switch (level) {
      case 'light':
        quality = baseParams.quality + 0.05
        targetSizeMB = sizeMB * (baseParams.ratio + 0.15)
        break
      case 'medium':
        quality = baseParams.quality
        targetSizeMB = sizeMB * baseParams.ratio
        break
      case 'extreme':
        quality = baseParams.quality - 0.1
        targetSizeMB = sizeMB * (baseParams.ratio - 0.1)
        break
      default:
        quality = 0.8
        targetSizeMB = sizeMB * 0.7
    }
  } else {
    // PNG 更合理的压缩策略
    switch (level) {
      case 'light':
        quality = baseParams.quality - 0.2
        targetSizeMB = sizeMB * (baseParams.ratio - 0.1)
        break
      case 'medium':
        quality = baseParams.quality - 0.3
        targetSizeMB = sizeMB * (baseParams.ratio - 0.2)
        break
      case 'extreme':
        quality = baseParams.quality - 0.4
        targetSizeMB = sizeMB * (baseParams.ratio - 0.3)
        break
      default:
        quality = 0.3
        targetSizeMB = sizeMB * 0.25
    }
  }

  return {
    maxSizeMB: targetSizeMB,
    useWebWorker: true,
    maxWidthOrHeight: Infinity, // 实际值会在 compressionHandler 中设置
    initialQuality: quality,
    alwaysKeepResolution: true,
    fileType: isJPEG ? 'image/jpeg' : undefined,
    exifOrientation: isJPEG ? 2 : undefined
  }
}
