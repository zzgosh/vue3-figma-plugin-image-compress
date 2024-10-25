import imageCompression from 'browser-image-compression'

const compressionLevelMap = {
  light: 'light_compressed',
  normal: 'medium_compressed',
  extreme: 'max_compressed',
  none: ''
} as const

type CompressionLevel = keyof typeof compressionLevelMap

export const compressionHandler = async (
  blob: Blob,
  format: string,
  compressionLevel: CompressionLevel,
  originalFileName: string
): Promise<{ blob: Blob; fileName: string; compressedSize: number }> => {
  const originalSize = blob.size
  const isJPEG = format.toLowerCase() === 'jpeg' || format.toLowerCase() === 'jpg'

  // 获取压缩配置选项
  const options = await getCompressionOptions(compressionLevel, originalSize, isJPEG)
  // 将 Blob 转换为 File 对象，便于后续处理
  const blobFile = new File([blob], originalFileName, { type: blob.type })

  // 获取原始图像尺寸
  const originalImage = await createImageBitmap(blobFile)
  const originalWidth = originalImage.width
  const originalHeight = originalImage.height

  // 设置最大宽高为原图最大边长，确保不会超出原始尺寸
  options.maxWidthOrHeight = Math.max(originalWidth, originalHeight)

  // 执行压缩
  const compressedFile = await imageCompression(blobFile, options)
  // 将压缩后的文件转换为指定格式的 Blob
  const compressedBlob = new Blob([await compressedFile.arrayBuffer()], { type: `image/${format}` })

  // 如果压缩后体积反而变大，返回原始文件
  if (compressedBlob.size > originalSize) {
    return {
      blob: blob,
      fileName: originalFileName,
      compressedSize: originalSize
    }
  }

  // 生成带压缩级别标识的文件名
  const compressionSuffix = compressionLevel !== 'none' ? `_${compressionLevelMap[compressionLevel]}` : ''
  const fileName = `${originalFileName.split('.')[0]}${compressionSuffix}.${format}`

  return {
    blob: compressedBlob, // 压缩后的文件数据
    fileName: fileName, // 新的文件名
    compressedSize: compressedBlob.size // 压缩后的文件大小
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
      case 'normal':
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
      case 'normal':
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
