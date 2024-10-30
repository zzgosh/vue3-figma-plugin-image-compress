# Small Image Compressor - Figma 图片压缩插件

这是一个用于 Figma 的图片压缩插件,可以帮助设计师在导出图片时自动进行压缩优化。本项目基于 [vue3-figma-plugin-starter](https://github.com/wendygaoyuan/vue3-figma-plugin-starter) 进行开发。

## 功能特点

- 支持批量导出并压缩图片
- 支持 JPG 和 PNG 格式
- 提供多种压缩级别选择(不压缩/轻微/普通/极致)
- 支持多种导出比例(1x/2x/3x/4x)
- 实时显示压缩前后的文件大小对比
- 自动打包为 ZIP 文件(当选择多个图片时)
- 支持导出文件名后缀切换

## 技术实现

### 核心依赖

- [browser-image-compression](https://github.com/Donaldcwl/browser-image-compression): 用于图片压缩处理,支持多线程压缩和多种图片格式
- [jszip](https://github.com/Stuk/jszip): 用于多文件打包,实现批量导出压缩后的图片
- [Vue 3](https://vuejs.org/): 构建用户界面的渐进式框架
- [TypeScript](https://www.typescriptlang.org/): 类型安全的 JavaScript 超集
- [Vite](https://vitejs.dev/): 现代前端开发与构建工具
- [TailwindCSS](https://tailwindcss.com/): 实用优先的 CSS 框架

### 压缩原理

1. 根据图片格式(JPG/PNG)和压缩级别选择不同的压缩策略
2. 通过 browser-image-compression 库进行压缩处理
3. 保持原始分辨率,仅优化文件大小
4. 如果压缩后体积反而增大,则保留原始文件
5. 多文件导出时自动打包为 ZIP

## 本地开发

### 安装

```bash
git clone https://github.com/your-username/small-image-compressor.git
cd small-image-compressor
npm install
```

### 开发调试

1. 启动开发服务器:

```bash
npm run dev
```

2. 在 Figma 中测试:

- 打开 Figma 桌面应用
- 进入插件菜单 -> 开发 -> 新建插件
- 选择 manifest.json 文件位置(位于 public/manifest.json)
- 运行以下命令监视文件变化:

```bash
npm run watch
```

### 项目结构

```
├── src/                   # 源代码目录
│   ├── App.vue           # 主界面组件
│   ├── main.ts           # 应用入口
│   ├── style.css         # 全局样式
│   ├── env.d.ts          # 类型声明
│   └── utils/            # 工具函数
│       ├── fileHandler.ts        # 文件处理
│       ├── compressionHandler.ts # 压缩逻辑
│       └── zipHandler.ts         # ZIP 打包处理
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
