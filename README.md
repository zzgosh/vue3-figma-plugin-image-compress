# Small Image Compressor for Figma

Small Image Compressor is a Figma plugin that exports selected images and compresses them before download. This project is built on top of [vue3-figma-plugin-starter](https://github.com/wendygaoyuan/vue3-figma-plugin-starter).

## Features

- Export and compress multiple images in one run
- Support `PNG`, `JPG`, and `WebP`
- Offer four compression levels: `None`, `Light`, `Medium`, and `Extreme`
- Support export scales from `0.5x` to `8x`
- Export real WebP bytes for both single-file and ZIP downloads
- Compare compressed exports against the same-format `None` baseline
- Keep the smaller same-format result when compression would increase file size
- Show output size and processing time for `None`; show size change and processing time for compressed exports
- Bundle multi-file exports into a ZIP archive
- Add scale and compression suffixes by default, with a `Disable Suffix` option

## Directory Structure

```text
.
├── .agents/                    # Repo-local Codex skills for maintainer workflows
├── .github/workflows/          # GitHub Actions release automation
├── figma/
│   └── code.ts                 # Figma plugin main thread
├── figma-plugin-changelog/     # Figma Community listing and release copy sources
├── public/
│   └── manifest.json           # Source manifest; load dist/manifest.json in Figma
├── src/
│   ├── App.vue                 # Plugin UI and export controls
│   ├── main.ts                 # Vue app entry
│   ├── style.css               # Tailwind and global styles
│   └── utils/
│       ├── compressionHandler.ts # Compression options and WebP validation
│       ├── constants.ts        # Compression types, labels, and suffixes
│       ├── fileHandler.ts      # Single and multi-file export orchestration
│       └── zipHandler.ts       # ZIP packaging
├── package.json                # npm scripts and dependencies
├── package-lock.json           # Locked dependency tree
├── tailwind.config.js          # Tailwind CSS configuration
├── tsconfig.json               # TypeScript project configuration
└── vite.config.ts              # Vite and plugin build configuration
```

## Installation

```bash
git clone https://github.com/zzgosh/vue3-figma-plugin-image-compress.git
cd vue3-figma-plugin-image-compress
npm install
```

## Development

Use the existing `npm` workflow in this repository:

```bash
npm run build
```

Or keep the build output updated while testing in Figma:

```bash
npm run watch
```

Other useful commands:

- `npm run dev`: start the local UI dev server
- `npm run preview`: preview the built UI locally

To test the plugin in Figma Desktop:

1. Run `npm run build` or `npm run watch`.
2. Open Figma Desktop.
3. Go to `Plugins` -> `Development` -> `Import plugin from manifest...`.
4. Select `dist/manifest.json` instead of `public/manifest.json`.
5. Re-run the plugin in Figma after each rebuild.

## Contributing

Pull requests are welcome. For substantial changes, please open an issue first so the export flow and Figma/UI interaction can be discussed before implementation.

## Acknowledgements

This project is built on [vue3-figma-plugin-starter](https://github.com/wendygaoyuan/vue3-figma-plugin-starter). Thanks to the original starter for providing the foundation that made the compression workflow easier to build.
