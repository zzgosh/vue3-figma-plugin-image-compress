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

## 提交与 Pull Request
- 提交信息遵循约定式前缀，参考历史：`feat: ...`、`fix: ...`、`docs: ...`，必要时加作用域（例：`feat(export): ...`）；保持中文或英文说明清晰可读。
- 提交前确保构建通过且无多余 `dist/` 手改；不要提交临时调试文件。
- PR 需包含：变更摘要、动机/影响、手动验证步骤（含关键截图或说明）、相关 issue 链接；如改动 UI，附主要界面截图或 GIF。
- 重大改动请先开 issue 讨论，确保 Figma 端与前端界面交互契合，避免破坏导出流程与压缩策略。
