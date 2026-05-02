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
├── .agents
│   └── skills
│       └── figma-plugin-release
│           ├── SKILL.md
│           ├── agents
│           │   └── openai.yaml
│           └── references
│               └── figma-release-workflow.md
├── .github
│   └── workflows
│       └── figma-release.yml
├── .gitignore
├── .prettierrc
├── .vscode
│   └── extensions.json
├── AGENTS.md
├── CLAUDE.md
├── LICENSE
├── README.md
├── figma
│   └── code.ts
├── figma-plugin-changelog
│   ├── ABOUT.md
│   ├── VERSION_HISTORY.md
│   └── releases
│       └── figma-v9.md
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
- `VERSION_HISTORY.md`: historical release notes through Version 8
- `releases/figma-vN.md`: bilingual GitHub and Figma release notes for Version N

Pushing a `figma-vN` tag triggers `.github/workflows/figma-release.yml`, which builds `dist/`, packages `small-image-compressor-figma-vN.zip`, and creates or updates a draft GitHub Release.

## Contributing

Pull requests are welcome. For substantial changes, please open an issue first so the export flow and Figma/UI interaction can be discussed before implementation.

## Acknowledgements

This project is built on [vue3-figma-plugin-starter](https://github.com/wendygaoyuan/vue3-figma-plugin-starter). Thanks to the original starter for providing the foundation that made the compression workflow easier to build.
