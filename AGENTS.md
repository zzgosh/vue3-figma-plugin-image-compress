# Repository Guidelines

## 项目结构与模块
- `src/`：Vue 3 + TypeScript 前端界面，核心逻辑集中在 `src/utils/`（`compressionHandler.ts`、`fileHandler.ts`、`zipHandler.ts`）和入口 `main.ts`。组件按页面功能拆分，保持单一职责。
- `figma/`：Figma 插件主线程代码 `code.ts`，负责与 Figma API 交互。
- `public/manifest.json`：插件源配置，构建后复制到 `dist/manifest.json`，Figma 加载时选择 `dist/manifest.json`。
- `figma-plugin-changelog/`：发布说明与版本历史文档。
- `dist/`：构建产物，勿直接手改。

## 构建、测试与开发命令
- `npm run dev`：本地开发服务器（适合界面调试，Figma 主线程需走构建）。
- `npm run build`：类型检查并构建插件产物到 `dist/`，发布前必跑。
- `npm run watch`：持续构建产物，便于在 Figma 中反复运行验证。
- `npm run preview`：本地预览打包产物（用于界面检查，不等同 Figma 运行环境）。

## 代码风格与命名
- TypeScript 强类型优先；组件建议使用 `<script setup>` 并保持函数纯净。
- 缩进 2 空格，单引号字符串，尽量使用 const；遵循 Vite/Vue 默认导入排序（先库后本地）。
- 组件文件使用 PascalCase（例：`ImageList.vue`），工具与常量使用 camelCase/kebab-case（例：`compressionHandler.ts`）。
- 样式首选 Tailwind 原子类，必要时放入 `src/style.css`；避免内联样式魔法数，保持可复用性。

## 测试与验证
- 当前无自动化测试；提交前至少运行 `npm run build`。
- 手动验证要点：在 Figma Desktop 中加载 `dist/manifest.json`，验证多格式压缩、并发队列、ZIP 导出、文件名后缀开关等核心路径；在 Watch 模式下修改代码后重新运行插件确认行为。

## Figma 插件发版约定
- 发版相关请求（如“发版”“打 tag”“Figma 插件版本”“插件版本”）优先使用 `$figma-plugin-release` skill；本文件只保留本仓库特有配置。
- Figma 插件版本使用 `Version N`；对应 Git tag 使用 `figma-vN`，例如 `figma-v9`。
- Release notes 文件路径为 `figma-plugin-changelog/releases/figma-vN.md`；该文件必须进入 release PR 并合并到 `main`，因为 `figma-vN` tag 指向的 commit 必须包含它，`.github/workflows/figma-release.yml` 会把它作为 release notes 输入。
- Release notes 使用英文 + 简体中文，内容应可直接复用到 Figma 插件后台；不要重复写 `# Version N`、`English`、`中文` 这类冗余标题，GitHub Release title 已提供版本标题。
- `figma-plugin-changelog/VERSION_HISTORY.md` 只保留 Version 8 及以前的历史记录；Version 9 及以后通过 GitHub Releases 记录。
- 推送 `figma-v*` tag 会触发 `.github/workflows/figma-release.yml`，构建 `dist/`，上传 `small-image-compressor-figma-vN.zip`，并创建或更新 draft GitHub Release。
- 远端仓库使用 GitHub Rulesets 保护 `main` 和 `staging`（规则集：`Main-Staging Protection`）；不要直接 push 到这些分支，release PR 默认使用 `gh pr merge --merge` 合并。
- 实际更新 Figma 插件仍使用本地同步 `main` 后运行 `npm run build` 生成的 `dist/manifest.json` 和 `dist/` 产物。
