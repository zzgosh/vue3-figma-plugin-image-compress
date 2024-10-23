<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { handleSingleFile, handleMultipleFiles } from './utils/fileHandler'
import type { CompressionLevel } from './utils/fileHandler'

const format = ref('PNG')
const compressionLevel = ref<CompressionLevel>('normal')
const exportScale = ref('1x')
const originalSize = ref(0)
const compressedSize = ref(0)

const exportElements = () => {
  parent.postMessage(
    { pluginMessage: { type: 'export-elements', format: format.value, compressionLevel: compressionLevel.value, exportScale: exportScale.value } },
    '*'
  )
}

onMounted(() => {
  window.onmessage = async (event) => {
    const msg = event.data.pluginMessage
    if (msg.type === 'download') {
      let result
      if (msg.files.length === 1) {
        result = await handleSingleFile(msg.files[0], compressionLevel.value)
      } else {
        result = await handleMultipleFiles(msg.files, compressionLevel.value)
      }
      originalSize.value = result.originalSize
      compressedSize.value = result.compressedSize
    }
  }
})

const formatSize = (size: number) => {
  return (size / 1024).toFixed(2) + ' KiB'
}

const compressionRatio = () => {
  if (originalSize.value === 0) return '0%'
  return ((1 - compressedSize.value / originalSize.value) * 100).toFixed(2) + '%'
}
</script>

<template>
  <div class="container">
    <h2>导出选中元素</h2>
    <select v-model="format">
      <option value="PNG">PNG</option>
      <option value="JPG">JPEG</option>
    </select>
    <select v-model="compressionLevel">
      <option value="none">不压缩</option>
      <option value="light">轻微压缩</option>
      <option value="normal">普通压缩</option>
      <option value="extreme">极致压缩</option>
    </select>
    <select v-model="exportScale">
      <option value="1x">1x (原始大小)</option>
      <option value="2x">2x</option>
      <option value="3x">3x</option>
      <option value="4x">4x</option>
    </select>
    <button @click="exportElements">导出</button>
    <div v-if="originalSize > 0" class="size-info">
      <p>原始大小: {{ formatSize(originalSize) }}</p>
      <p>压缩后大小: {{ formatSize(compressedSize) }}</p>
      <p>压缩率: {{ compressionRatio() }}</p>
    </div>
  </div>
</template>

<style scoped>
.container {
  font-family: sans-serif;
  text-align: center;
  padding: 20px;
}

select,
button {
  margin: 10px;
  padding: 5px;
}

.size-info {
  margin-top: 20px;
  text-align: left;
}
</style>
