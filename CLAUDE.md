# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个 Figma 插件，用于批量导出和压缩图片。插件使用 Vue 3 + TypeScript 构建，支持 PNG、JPG 和 WebP 格式的导出，并提供多种压缩级别和缩放选项。

## 常用命令

```bash
# 开发模式（启动 Vite 开发服务器）
npm run dev

# 监听模式构建（开发 Figma 插件时使用）
npm run watch

# 生产构建
npm run build

# 预览构建结果
npm run preview
```

## 架构说明

### 双层架构
1. **插件层** (`figma/code.ts`)：运行在 Figma 沙箱环境中，负责与 Figma API 交互
2. **UI 层** (`src/`）：Vue 3 应用，运行在 iframe 中，负责用户界面和图片处理

### 通信模式
- 使用 `postMessage` API 在插件层和 UI 层之间通信
- 消息类型定义在 `figma/code.ts` 和 `src/App.vue` 中
- 主要消息流：
  - `selectionChange`: 选择变化通知
  - `exportImages`: 导出请求
  - `compressionComplete`: 压缩完成通知

### 核心模块
- `src/utils/compressionHandler.ts`: 图片压缩逻辑，针对不同格式采用差异化策略
- `src/utils/fileHandler.ts`: 文件处理和下载
- `src/utils/zipHandler.ts`: 多文件 ZIP 打包
- `src/utils/constants.ts`: 压缩参数和文件名后缀映射

### 构建特点
- 使用 `vite-plugin-singlefile` 将所有资源打包成单个 HTML 文件（Figma 插件要求）
- 双入口构建：UI (index.html) 和插件代码 (figma/code.ts)

## 开发注意事项

1. **类型安全**：修改代码前运行 `vue-tsc --noEmit` 检查类型
2. **样式系统**：使用 TailwindCSS，避免内联样式
3. **并发控制**：图片压缩使用 p-limit 限制并发数为 3
4. **错误处理**：使用自定义 CompressionError 类，UI 显示错误提示
5. **文件命名**：遵循现有的后缀系统（_l/_m/_x 表示压缩级别，@2x/@3x/@4x 表示缩放）