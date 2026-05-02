/// <reference types="@figma/plugin-typings" />

figma.showUI(__html__)

figma.ui.resize(300, 340)

let pendingExportCount: number | null = null

const postSelectionChange = () => {
  const selection = figma.currentPage.selection
  figma.ui.postMessage({
    type: 'selectionChange',
    count: selection.length,
    elementIds: selection.map((node) => node.id)
  })
}

postSelectionChange()
figma.on('selectionchange', postSelectionChange)

figma.ui.onmessage = async (msg) => {
  if (msg.type === 'export-complete') {
    if (pendingExportCount !== null) {
      figma.notify(`Exported ${pendingExportCount} file${pendingExportCount > 1 ? 's' : ''}`)
      pendingExportCount = null
    }
    return
  }

  if (msg.type === 'export-failed') {
    pendingExportCount = null
    return
  }

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
            constraint: { type: 'SCALE', value: parseFloat(msg.exportScale) }
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

    pendingExportCount = files.length
    figma.ui.postMessage({
      type: 'download',
      files: files,
      compressionLevel: msg.compressionLevel,
      disableSuffix: msg.disableSuffix,
      elementIds: figma.currentPage.selection.map((node) => node.id)
    })
  }
}
