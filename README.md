# Figma 插件启动模板

这是一个用于创建 Figma 插件的启动模板,使用了 Vue 3、TypeScript 和 Vite。本项目最初克隆自 [vue3-figma-plugin-starter](https://github.com/wendygaoyuan/vue3-figma-plugin-starter),在原始项目的代码框架基础上进行了插件功能的开发。

## 功能特点

- 使用 Vue 3 构建用户界面
- TypeScript 支持
- Vite 用于快速开发和构建
- 集成了 Figma 插件 API
- 包含文件处理和压缩功能

## 安装

1. 克隆此仓库:

```bash
git clone https://github.com/jeejeeguan/vue3-figma-plugin-image-compress.git
cd vue3-figma-plugin-image-compress
```

2. 安装依赖:

```bash
npm install
```

## 开发

启动开发服务器:

```bash
npm run dev
```

## 在 Figma 中测试

1. 打开 Figma 桌面应用程序
2. 创建一个新的插件
3. 修改 `public/manifest.json` 文件:

```json
{
  "name": "你的插件名称",
  "id": "你的插件ID",
  "api": "1.0.0",
  "main": "code.js",
  "editorType": ["figma"],
  "ui": "index.html"
}
```

4. 运行以下命令以监视文件变化并自动重新构建:

```bash
npm run watch
```

5. 在 Figma 中运行你的插件

## 项目结构

- `src/`: 源代码目录
  - `App.vue`: 主 Vue 组件
  - `utils/`: 实用工具函数
    - `fileHandler.ts`: 文件处理相关功能
    - `compressionHandler.ts`: 压缩相关功能
- `figma/`: Figma 相关代码
  - `code.ts`: Figma 插件主要逻辑
- `public/`: 静态资源
  - `manifest.json`: Figma 插件配置文件
- `vite.config.ts`: Vite 配置文件
- `tsconfig.json` 和 `tsconfig.node.json`: TypeScript 配置文件

## 构建

构建生产版本:

```bash
npm run build
```

## 贡献

欢迎提交 Pull Requests 来改进这个项目。对于重大更改,请先开 issue 讨论您想要改变的内容。

## 致谢

本项目基于 [vue3-figma-plugin-starter](https://github.com/wendygaoyuan/vue3-figma-plugin-starter) 进行开发。感谢原作者提供的优秀框架。

## 许可证

[MIT](https://choosealicense.com/licenses/mit/)
