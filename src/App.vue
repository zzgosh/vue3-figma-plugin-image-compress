<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { handleSingleFile, handleMultipleFiles } from './utils/fileHandler'
import { Switch, SwitchDescription, SwitchGroup, SwitchLabel } from '@headlessui/vue'
import { compressionSuffixMap, type CompressionLevel } from './utils/constants'

const format = ref('PNG') // 修改默认值为 JPG
const compressionLevel = ref<CompressionLevel>('medium')
const exportScale = ref('1x') // 修改默认值为 1x
const originalSize = ref(0)
const compressedSize = ref(0)
const selectedCount = ref(0)
const isExporting = ref(false) // 新增：跟踪导出状态
const enabled = ref<boolean>(false)

// 新增：跟踪已压缩元素的 ID 集合
const compressedElementIds = ref<string[]>([])

const errorMessage = ref('')
const showError = ref(false)

const compressionTime = ref(0)
const compressionStartTime = ref(0)

const showErrorMessage = (message: string) => {
  errorMessage.value = message
  showError.value = true
  setTimeout(() => {
    showError.value = false
  }, 3000)
}

const exportElements = async () => {
  if (isExporting.value) return
  isExporting.value = true

  try {
    await parent.postMessage(
      {
        pluginMessage: {
          type: 'export-elements',
          format: format.value,
          compressionLevel: compressionLevel.value,
          exportScale: exportScale.value,
          enableSuffix: enabled.value
        }
      },
      '*'
    )
  } catch (error) {
    console.error('Export failed:', error)
  }
}

onMounted(() => {
  window.onmessage = async (event) => {
    const msg = event.data.pluginMessage
    if (msg.type === 'download') {
      try {
        compressionStartTime.value = Date.now() // 开始计时
        let result
        if (msg.files.length === 1) {
          result = await handleSingleFile(msg.files[0], compressionLevel.value as CompressionLevel, enabled.value)
        } else {
          result = await handleMultipleFiles(msg.files, compressionLevel.value as CompressionLevel, enabled.value)
        }
        compressionTime.value = (Date.now() - compressionStartTime.value) / 1000 // 计算耗时

        originalSize.value = result.originalSize
        compressedSize.value = result.compressedSize
        compressedElementIds.value = msg.elementIds

        parent.postMessage({ pluginMessage: { type: 'export-complete' } }, '*')
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '未知错误'
        showErrorMessage(`压缩失败: ${errorMessage}`)
      } finally {
        isExporting.value = false
      }
    } else if (msg.type === 'selectionChange') {
      const currentIds = msg.elementIds // 需要从 Figma 插件传递
      selectedCount.value = msg.count

      // 比较当前选择的元素是否与上次压缩的元素完全相同
      const hasSelectionChanged = !areArraysEqual(currentIds, compressedElementIds.value)

      if (hasSelectionChanged) {
        // 重置压缩数据
        originalSize.value = 0
        compressedSize.value = 0
        compressionTime.value = 0 // 重置时间
      }
    }
  }
})

// 辅助函数：比较两个数组是否包含相同的元素（顺序无关）
const areArraysEqual = (arr1: string[], arr2: string[]) => {
  if (arr1.length !== arr2.length) return false
  const set1 = new Set(arr1)
  return arr2.every((id) => set1.has(id))
}

// 修改格式化大小的函数
const formatSize = (size: number) => {
  if (size >= 1024 * 1024) {
    return (size / (1024 * 1024)).toFixed(2) + ' MB'
  }
  return (size / 1024).toFixed(2) + ' KB'
}

// 修改压缩率计算函数，带百分号返回
const compressionRatio = () => {
  if (originalSize.value === 0) return '0'
  return ((1 - compressedSize.value / originalSize.value) * 100).toFixed(1)
}

// 新增：获取文件数量的计算属性
const getFileCountText = () => {
  const count = selectedCount.value
  return `Compressed ${count} image${count > 1 ? 's' : ''}`
}

// 新增：获取文件名的示例
// const getFileNameExample = () => {
//   const baseName = 'image_example'
//   const scaleStr = exportScale.value !== '1x' && enabled.value ? `_${exportScale.value}` : ''
//   const compressionStr = compressionLevel.value !== 'none' && enabled.value ? compressionSuffixMap[compressionLevel.value] : ''
//   const extension = `.${format.value.toLowerCase()}`
//   return `${baseName}${scaleStr}${compressionStr}${extension}`
// }
</script>

<template>
  <div class="pt-5 px-5">
    <div class="flex items-center mb-4">
      <label for="format" class="flex-none w-[112px] block text-sm leading-6 text-gray-500">Format</label>
      <select
        id="format"
        v-model="format"
        class="flex-1 block rounded-md border-0 py-1.5 pl-3 pr-10 text-sm text-gray-950 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
      >
        <option value="PNG">PNG</option>
        <option value="JPG">JPG</option>
        <option value="WEBP">WebP</option>
      </select>
    </div>

    <div class="flex items-center mb-4">
      <label for="compression" class="flex-none w-[112px] block text-sm leading-6 text-gray-500">Compression</label>
      <select
        id="compression"
        v-model="compressionLevel"
        class="flex-1 block rounded-md border-0 py-1.5 pl-3 pr-10 text-sm text-gray-950 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
      >
        <option value="none">None</option>
        <option value="light">Light</option>
        <option value="medium">Medium</option>
        <option value="extreme">Extreme</option>
      </select>
    </div>

    <div class="flex items-center mb-4">
      <label for="scale" class="flex-none w-[112px] block text-sm leading-6 text-gray-500">Scale</label>
      <select
        id="scale"
        v-model="exportScale"
        class="flex-1 block rounded-md border-0 py-1.5 pl-3 pr-10 text-sm text-gray-950 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
      >
        <option value="0.5x">0.5x</option>
        <option value="1x">1x</option>
        <option value="2x">2x</option>
        <option value="3x">3x</option>
        <option value="4x">4x</option>
        <option value="6x">6x</option>
        <option value="8x">8x</option>
      </select>
    </div>

    <SwitchGroup as="div" class="flex items-center justify-between mb-5">
      <span class="flex flex-grow flex-col">
        <SwitchLabel as="span" class="text-sm text-gray-500" passive>Append Suffix</SwitchLabel>
        <!-- <SwitchDescription as="span" class="text-sm text-gray-500"> {{ getFileNameExample() }} </SwitchDescription> -->
      </span>
      <Switch
        v-model="enabled"
        :class="[
          enabled ? 'bg-blue-500' : 'bg-gray-200',
          'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out'
        ]"
      >
        <span
          aria-hidden="true"
          :class="[
            enabled ? 'translate-x-5' : 'translate-x-0',
            'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out'
          ]"
        />
      </Switch>
    </SwitchGroup>

    <button
      @click="exportElements"
      type="button"
      :disabled="selectedCount === 0 || isExporting"
      class="w-full inline-flex items-center justify-center rounded-md px-3 py-2 text-sm text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
      :class="[selectedCount === 0 ? 'bg-gray-400 cursor-not-allowed' : isExporting ? 'bg-blue-500' : 'bg-blue-500 hover:bg-blue-600']"
    >
      {{ isExporting ? 'Exporting...' : `Export (${selectedCount})` }}
    </button>

    <!-- 替换提示信息部分 -->
    <div class="mt-4">
      <div v-if="selectedCount === 0" class="text-sm text-gray-500">Please select images to export</div>

      <div v-if="selectedCount > 0 && originalSize > 0">
        <p class="text-sm text-gray-500 mb-1">{{ getFileCountText() }}</p>
        <p class="text-[13px]/[18px] text-gray-500">
          {{ formatSize(originalSize) }}
          <span class="mx-[2px]">→</span>
          {{ formatSize(compressedSize) }},
          <span class="ml-[2px]" :class="Number(compressionRatio()) > 0 ? 'text-green-600' : 'text-gray-500'"
            >{{ Number(compressionRatio()) > 0 ? '-' : '' }}{{ compressionRatio() }}%</span
          ><span class="text-gray-500" v-if="compressionTime > 0">, {{ compressionTime.toFixed(1) }}s</span>
        </p>
      </div>
    </div>

    <!-- 在 template 中添加错误提示组件 -->
    <div v-if="showError" class="fixed top-4 right-4 bg-red-100 border border-red-400 text-orange-600 px-4 py-3 rounded" role="alert">
      <span class="block sm:inline">{{ errorMessage }}</span>
    </div>
  </div>
</template>

<style></style>
