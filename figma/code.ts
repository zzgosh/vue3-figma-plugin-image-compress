/// <reference types="@figma/plugin-typings" />

figma.showUI(__html__)

figma.ui.resize(300, 300)

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
      figma.notify('请至少选择一个元素进行导出')
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
            format: msg.format.toUpperCase(),
            constraint: { type: 'SCALE', value: parseInt(msg.exportScale) }
          }

          const buffer = await node.exportAsync(settings)
          files.push({
            buffer: buffer,
            fileName: `${node.name}${msg.exportScale !== '1x' ? '_' + msg.exportScale : ''}.${msg.format.toLowerCase()}`,
            format: msg.format.toLowerCase(),
            scale: msg.exportScale
          })
        } catch (error) {
          console.error(`导出 ${node.name} 失败:`, error)
          figma.notify(`导出 ${node.name} 失败`)
        }
      } else {
        figma.notify(`无法导出 ${(node as SceneNode).name}，因为它不支持导出`)
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
        figma.notify(`已导出 ${files.length} 个文件`)
        // 移除监听器
        figma.ui.off('message', messageHandler)
      }
    }

    figma.ui.on('message', messageHandler)
  }
}
