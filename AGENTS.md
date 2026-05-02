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

## Figma 插件发版流程
- Figma 插件版本使用 `Version N` 表达；对应 Git tag 固定使用 `figma-vN`，例如 `figma-v9`。不要使用普通 `v9`，避免和 npm/package 版本混淆。
- 用户说“可以发版了”“发版”“发新版”“Figma 插件发版”“插件版本”等指令时，默认把当前开发分支的阶段性成果整理成一个 release PR：先检查未提交/已暂存改动，运行必要验证，补齐 release notes 文件，提交并推送分支，创建 PR，合并到 `main` 后再打 tag。
- 发版前必须准备并提交 `figma-plugin-changelog/releases/figma-vN.md`，使用英文 + 简体中文的 Markdown 文案。该文件是 GitHub Release notes 和 Figma 插件后台 release notes 的共用来源，也是 `.github/workflows/figma-release.yml` 的必需输入。创建或更新该文件前先阅读 `figma-plugin-changelog/releases/README.md`。
- `figma-plugin-changelog/releases/figma-vN.md` 必须存在于被 `figma-vN` tag 指向的 commit 中。推荐在 release PR 中同时包含代码变更和该 notes 文件；如果代码已经先合并到 `main`，则再开一个 release-prep PR/commit 添加 notes 文件，合并后把 tag 打在这个包含 notes 的 commit 上。不要在推送 tag 后才本地创建 notes 文件，否则 GitHub Actions 会因为找不到该文件而失败。
- 发版 tag 必须打在已经合并到 `main` 的 release commit 上。不要在功能分支、未合并 PR、或未确认的临时 commit 上打 `figma-v*` tag。
- 远端仓库使用 GitHub Rulesets 保护 `main` 和 `staging`（规则集：`Main-Staging Protection`）：禁止删除、禁止 non-fast-forward，变更必须通过 PR；允许 `merge` / `squash` / `rebase`，不要求审批数且无 bypass actors。不要直接 push 到 `main` / `staging`；合并 release PR 时默认使用 `gh pr merge --merge`。
- 推送 `figma-v*` tag 会触发 `.github/workflows/figma-release.yml`：CI 会运行 `npm ci`、`npm run build`，把 `dist/` 打成 zip，并创建或更新 draft GitHub Release。
- GitHub Release asset 是归档用构建产物；实际更新 Figma 插件时仍以本地确认过的 `dist/manifest.json` 和 `dist/` 产物为准。
- Release PR 合并后，Codex 应切换到 `main`，`git pull --ff-only` 同步最新进度，在 `main` 上创建 annotated tag（例如 `git tag -a figma-v9 -m "Small Image Compressor Version 9"`），推送 tag，使用 `gh run watch` 等待 tag 触发的 GitHub Actions 完成，并检查 draft GitHub Release 与构建产物 asset。
