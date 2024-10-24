<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { handleSingleFile, handleMultipleFiles } from './utils/fileHandler'
import type { CompressionLevel } from './utils/fileHandler'
import { ArrowPathIcon } from '@heroicons/vue/20/solid'

const format = ref('PNG')
const compressionLevel = ref<CompressionLevel>('normal')
const exportScale = ref('1x')
const originalSize = ref(0)
const compressedSize = ref(0)
const selectedCount = ref(0)
const isExporting = ref(false) // 新增：跟踪导出状态
const isSpinning = ref(false) // 新增：专门控制动画的状态

// 新增：跟踪已压缩元素的 ID 集合
const compressedElementIds = ref<string[]>([])

const exportElements = async () => {
  if (isExporting.value) return

  // 先触发动画
  isSpinning.value = true
  isExporting.value = true

  // 强制一次重绘
  requestAnimationFrame(() => {
    requestAnimationFrame(async () => {
      try {
        await parent.postMessage(
          {
            pluginMessage: { type: 'export-elements', format: format.value, compressionLevel: compressionLevel.value, exportScale: exportScale.value }
          },
          '*'
        )
      } catch (error) {
        console.error('Export failed:', error)
      }
    })
  })
}

onMounted(() => {
  window.onmessage = async (event) => {
    const msg = event.data.pluginMessage
    if (msg.type === 'download') {
      try {
        let result
        if (msg.files.length === 1) {
          result = await handleSingleFile(msg.files[0], compressionLevel.value)
        } else {
          result = await handleMultipleFiles(msg.files, compressionLevel.value)
        }
        originalSize.value = result.originalSize
        compressedSize.value = result.compressedSize
        // 记录这次压缩的元素 ID
        compressedElementIds.value = msg.elementIds // 需要从 Figma 插件传递
      } finally {
        isSpinning.value = false
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

// 修改压缩率计算函数，不带百分号返回
const compressionRatio = () => {
  if (originalSize.value === 0) return '0'
  return ((1 - compressedSize.value / originalSize.value) * 100).toFixed(1)
}

// 新增：获取文件数量的计算属性
const getFileCountText = () => {
  const count = selectedCount.value
  return `共完成压缩 ${count} 张图片`
}
</script>

<template>
  <div class="py-4 px-5">
    <div class="flex items-center mb-4">
      <label for="format" class="flex-none w-[72px] block text-sm font-medium leading-6 text-gray-500">图片格式</label>
      <select
        id="format"
        v-model="format"
        class="flex-1 block rounded-md border-0 py-1.5 pl-3 pr-10 text-sm text-gray-950 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
      >
        <option value="PNG">PNG</option>
        <option value="JPG">JPEG</option>
      </select>
    </div>

    <div class="flex items-center mb-4">
      <label for="compression" class="flex-none w-[72px] block text-sm font-medium leading-6 text-gray-500">压缩级别</label>
      <select
        id="compression"
        v-model="compressionLevel"
        class="flex-1 block rounded-md border-0 py-1.5 pl-3 pr-10 text-sm text-gray-950 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
      >
        <option value="none">不压缩</option>
        <option value="light">轻微压缩</option>
        <option value="normal">普通压缩</option>
        <option value="extreme">极致压缩</option>
      </select>
    </div>

    <div class="flex items-center mb-4">
      <label for="scale" class="flex-none w-[72px] block text-sm font-medium leading-6 text-gray-500">导出比例</label>
      <select
        id="scale"
        v-model="exportScale"
        class="flex-1 block rounded-md border-0 py-1.5 pl-3 pr-10 text-sm text-gray-950 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
      >
        <option value="1x">1x</option>
        <option value="2x">2x</option>
        <option value="3x">3x</option>
        <option value="4x">4x</option>
      </select>
    </div>

    <button
      @click="exportElements"
      type="button"
      :disabled="selectedCount === 0 || isExporting"
      class="w-full inline-flex items-center justify-center gap-x-2 rounded-md px-3 py-2 text-sm text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
      :class="[selectedCount === 0 ? 'bg-gray-400 cursor-not-allowed' : isExporting ? 'bg-blue-500' : 'bg-blue-500 hover:bg-blue-600']"
    >
      导出 ({{ selectedCount }})
      <ArrowPathIcon v-show="isExporting" class="w-4 h-4 transition-transform duration-100 ease-in-out" :class="{ 'rotate-animation': isSpinning }" />
    </button>

    <!-- 替换提示信息部分 -->
    <div class="mt-4">
      <div v-if="selectedCount === 0" class="text-sm text-gray-500">请选择需要导出的图片</div>

      <div v-if="selectedCount > 0 && originalSize > 0" class="text-sm text-gray-950">
        <p class="mb-2">{{ getFileCountText() }}</p>
        <p>
          {{ formatSize(originalSize) }}
          <span class="mx-1">---></span>
          {{ formatSize(compressedSize) }},
          <span class="ml-1" :class="Number(compressionRatio()) > 0 ? 'text-green-600' : 'text-gray-600'">
            {{ Number(compressionRatio()) > 0 ? '-' : '' }}{{ compressionRatio() }}%
          </span>
        </p>
      </div>
    </div>
  </div>
</template>

<style>
@keyframes continuous-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.rotate-animation {
  animation: continuous-spin 1s linear infinite;
  will-change: transform;
  transform-origin: center;
  backface-visibility: hidden;
  /* 添加动画启动时的性能优化 */
  animation-play-state: running;
  animation-delay: 0s;
}
</style>
