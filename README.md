# Small Image Compressor - Figma 图片压缩插件

这是一个用于 Figma 的图片压缩插件,可以帮助设计师在导出图片时自动进行压缩优化。本项目基于 [vue3-figma-plugin-starter](https://github.com/wendygaoyuan/vue3-figma-plugin-starter) 进行开发。

## 功能特点

- 支持批量导出并压缩图片
- 支持 JPG、PNG 和 WebP 格式
- 提供多种压缩级别选择(None/Light/Medium/Extreme)
- 支持多种导出比例(0.5x/1x/2x/3x/4x/6x/8x)
- 显示压缩前后的文件大小对比
- 显示压缩处理时间
- 对多文件打包为 ZIP 导出
- 支持导出文件名是否添加后缀的设置
- 智能压缩策略（根据图片大小自动调整）
- 支持多线程并行压缩处理

## 技术实现

### 核心依赖

- [browser-image-compression](https://github.com/Donaldcwl/browser-image-compression): 用于图片压缩处理,支持多线程压缩和多种图片格式
- [jszip](https://github.com/Stuk/jszip): 用于多文件打包,实现批量导出压缩后的图片
- [Vue 3](https://vuejs.org/): 构建用户界面的渐进式框架
- [TypeScript](https://www.typescriptlang.org/): 类型安全的 JavaScript 超集
- [Vite](https://vitejs.dev/): 现代前端开发与构建工具
- [TailwindCSS](https://tailwindcss.com/): 实用优先的 CSS 框架
- [p-limit](https://www.npmjs.com/package/p-limit): 用于控制并发压缩任务数量

### 压缩原理

1. 针对不同格式(JPG/PNG/WebP)采用差异化压缩策略
2. 通过 browser-image-compression 库进行压缩处理
3. 保持原始分辨率,仅优化文件大小
4. 智能判断压缩效果，当压缩后体积增大时保留原文件
5. 使用 Web Worker 实现多线程压缩
6. 使用 p-limit 控制并发压缩数量

## 本地开发

### 安装

```bash
git clone https://github.com/your-username/small-image-compressor.git
cd small-image-compressor
npm install
```

### 开发调试

1. 构建插件:

```bash
npm run build
# 或使用监视模式（推荐）
npm run watch
```

2. 在 Figma 中加载插件:

- 打开 Figma 桌面应用
- 进入插件菜单 -> 开发 -> 新建插件
- 选择 manifest.json 文件位置：**选择 `dist/manifest.json`**（注意：不是 public/manifest.json）
- 插件将出现在开发菜单中

3. 开发提示:

- 使用 `npm run watch` 可以自动监视文件变化并重新构建
- 修改代码后，在 Figma 中重新运行插件即可看到更新
- `public/manifest.json` 是源文件，构建后会复制到 `dist/` 目录

### 项目结构

```
├── src/                   # 源代码目录
│   ├── App.vue           # 主界面组件
│   ├── main.ts           # 应用入口
│   ├── style.css         # 全局样式
│   ├── env.d.ts          # 类型声明
│   └── utils/            # 工具函数
│       ├── fileHandler.ts        # 文件处理与下载
│       ├── compressionHandler.ts # 图片压缩核心逻辑
│       ├── zipHandler.ts         # ZIP 打包处理
│       └── constants.ts          # 常量和类型定义
│
├── figma/                 # Figma 相关代码
│   └── code.ts           # Figma 插件主逻辑
│
├── public/               # 静态资源
│   ├── manifest.json     # Figma 插件配置
│   └── favicon.ico       # 网站图标
│
├── vite.config.ts        # Vite 配置
├── tsconfig.json         # TypeScript 配置
├── tsconfig.node.json    # Node TypeScript 配置
├── tailwind.config.js    # TailwindCSS 配置
└── postcss.config.js     # PostCSS 配置
```

### 构建

```bash
npm run build
```

## 贡献

欢迎提交 Pull Requests 来改进这个项目。对于重大更改,请先开 issue 讨论您想要改变的内容。

## 致谢

本项目基于 [vue3-figma-plugin-starter](https://github.com/wendygaoyuan/vue3-figma-plugin-starter) 开发。感谢该项目提供的优秀框架,使我们能够专注于压缩功能的实现。
