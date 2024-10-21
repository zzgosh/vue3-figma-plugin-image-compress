import imageCompression from 'browser-image-compression'

export const compressionHandler = async (
  blob: Blob,
  format: string,
  compressionLevel: string,
  originalFileName: string
): Promise<{ blob: Blob; fileName: string }> => {
  const originalSize = blob.size
  const options = await getCompressionOptions(compressionLevel, originalSize)
  const blobFile = new File([blob], originalFileName, { type: blob.type })

  // 获取原始图像尺寸
  const originalImage = await createImageBitmap(blobFile)
  const originalWidth = originalImage.width
  const originalHeight = originalImage.height

  // 添加尺寸参数到压缩选项
  options.maxWidthOrHeight = Math.max(originalWidth, originalHeight)
  options.initialQuality = 1 // 设置初始质量为最高
  options.alwaysKeepResolution = true // 总是保持分辨率

  const compressedFile = await imageCompression(blobFile, options)
  const compressedBlob = new Blob([await compressedFile.arrayBuffer()], { type: `image/${format}` })

  const fileName = `${originalFileName.split('.')[0]}_compressed.${format}`

  return { blob: compressedBlob, fileName }
}

const getCompressionOptions = async (level: string, originalSize: number) => {
  const sizeMB = originalSize / (1024 * 1024)
  let targetSizeMB: number

  switch (level) {
    case 'light':
      targetSizeMB = sizeMB < 1 ? sizeMB * 0.95 : Math.max(sizeMB * 0.9, 1)
      break
    case 'normal':
      targetSizeMB = sizeMB < 0.5 ? sizeMB * 0.9 : Math.max(sizeMB * 0.7, 0.5)
      break
    case 'extreme':
      targetSizeMB = sizeMB < 0.2 ? sizeMB * 0.8 : Math.max(sizeMB * 0.5, 0.2)
      break
    default:
      targetSizeMB = sizeMB < 0.5 ? sizeMB * 0.9 : Math.max(sizeMB * 0.7, 0.5)
  }

  return {
    maxSizeMB: targetSizeMB,
    useWebWorker: true,
    maxWidthOrHeight: Infinity, // 初始设置为无限大,后面会根据实际尺寸调整
    initialQuality: 1, // 设置初始质量为最高
    alwaysKeepResolution: true // 总是保持分辨率
  }
}
