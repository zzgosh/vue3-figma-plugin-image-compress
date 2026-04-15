# Small Image Compressor for Figma

Small Image Compressor is a Figma plugin that exports selected images and compresses them before download. This project is built on top of [vue3-figma-plugin-starter](https://github.com/wendygaoyuan/vue3-figma-plugin-starter).

## Features

- Export and compress multiple images in one run
- Support `PNG`, `JPG`, and `WebP`
- Offer four compression levels: `None`, `Light`, `Medium`, and `Extreme`
- Support export scales from `0.5x` to `8x`
- Show original size, compressed size, and processing time
- Bundle multi-file exports into a ZIP archive
- Optionally append compression suffixes to exported file names

## Directory Structure

```text
.
├── AGENTS.md
├── CLAUDE.md
├── LICENSE
├── README.md
├── figma
│   └── code.ts
├── figma-plugin-changelog
│   ├── ABOUT.md
│   └── VERSION_HISTORY.md
├── index.html
├── package-lock.json
├── package.json
├── postcss.config.js
├── public
│   ├── favicon.ico
│   └── manifest.json
├── src
│   ├── App.vue
│   ├── assets
│   │   └── logo.png
│   ├── env.d.ts
│   ├── main.ts
│   ├── style.css
│   └── utils
│       ├── compressionHandler.ts
│       ├── constants.ts
│       ├── fileHandler.ts
│       └── zipHandler.ts
├── tailwind.config.js
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
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

## Release Notes Assets

The `figma-plugin-changelog/` directory contains reusable content for Figma Community releases:

- `ABOUT.md`: plugin description and usage copy
- `VERSION_HISTORY.md`: version history for release notes

## Contributing

Pull requests are welcome. For substantial changes, please open an issue first so the export flow and Figma/UI interaction can be discussed before implementation.

## Acknowledgements

This project is built on [vue3-figma-plugin-starter](https://github.com/wendygaoyuan/vue3-figma-plugin-starter). Thanks to the original starter for providing the foundation that made the compression workflow easier to build.
