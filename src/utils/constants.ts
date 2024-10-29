export type CompressionLevel = 'none' | 'light' | 'medium' | 'extreme'

// 用于文件名后缀的简短映射
export const compressionSuffixMap = {
  light: '_l',
  medium: '_m',
  extreme: '_x',
  none: ''
} as const

// 用于文件名的完整映射（如果需要）
export const compressionFullNameMap = {
  light: 'compressed_light',
  medium: 'compressed_medium',
  extreme: 'compressed_extreme',
  none: ''
} as const
