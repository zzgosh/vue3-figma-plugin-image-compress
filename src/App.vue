<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { handleSingleFile, handleMultipleFiles } from './utils/fileHandler'

const format = ref('PNG')
const compressionLevel = ref('normal')
const exportScale = ref('1x')

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
      if (msg.files.length === 1) {
        await handleSingleFile(msg.files[0], compressionLevel.value)
      } else {
        await handleMultipleFiles(msg.files, compressionLevel.value)
      }
    }
  }
})
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
</style>
