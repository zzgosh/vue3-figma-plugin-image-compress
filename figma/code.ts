/// <reference types="@figma/plugin-typings" />

figma.showUI(__html__)

figma.ui.resize(300, 328)

// 新增：发送初始选中状态
figma.ui.postMessage({
  type: 'selectionChange',
  count: figma.currentPage.selection.length
})

// 新增：监听选中变化
figma.on('selectionchange', () => {
  const selection = figma.currentPage.selection
  figma.ui.postMessage({
    type: 'selectionChange',
    count: selection.length,
    elementIds: selection.map((node) => node.id) // 添加元素 ID
  })
})

figma.ui.onmessage = async (msg) => {
  if (msg.type === 'export-elements') {
    const selection = figma.currentPage.selection
    if (selection.length === 0) {
      figma.notify('Please select at least one element to export')
      return
    }

    interface ExportFile {
      buffer: Uint8Array
      fileName: string
      format: string
      scale: string
    }

    const files: ExportFile[] = []
    for (const node of selection) {
      if ('exportAsync' in node) {
        try {
          const settings = {
            format: msg.format === 'WEBP' ? 'PNG' : msg.format.toUpperCase(),
            constraint: { type: 'SCALE', value: parseInt(msg.exportScale) }
          }

          const buffer = await node.exportAsync(settings)
          files.push({
            buffer: buffer,
            fileName: `${node.name}.${msg.format.toLowerCase()}`,
            format: msg.format.toLowerCase(),
            scale: msg.exportScale
          })
        } catch (error) {
          console.error(`Failed to export ${node.name}:`, error)
          figma.notify(`Failed to export ${node.name}`)
        }
      } else {
        figma.notify(`Cannot export ${(node as SceneNode).name}, it doesn't support exporting`)
      }
    }

    // 发送文件数据到 UI
    figma.ui.postMessage({
      type: 'download',
      files: files,
      compressionLevel: msg.compressionLevel,
      elementIds: figma.currentPage.selection.map((node) => node.id)
    })

    // 使用一次性监听器
    const messageHandler = (response) => {
      if (response.type === 'export-complete') {
        figma.notify(`Exported ${files.length} file${files.length > 1 ? 's' : ''}`)
        // 移除监听器
        figma.ui.off('message', messageHandler)
      }
    }

    figma.ui.on('message', messageHandler)
  }
}
