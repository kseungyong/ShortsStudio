# ShortsStudio

A YouTube Shorts-focused video editor for web, built on top of OpenCut.

> **Forked from [OpenCut](https://github.com/OpenCut-app/OpenCut)** — the free and open-source browser video editor. ShortsStudio is a private fork with a Shorts-first feature focus and our own brand applied. The upstream OpenCut codebase, architecture, and MIT license are preserved.

[![License: MIT](https://img.shields.io/badge/license-MIT-green?style=flat)](LICENSE)

## What is ShortsStudio?

ShortsStudio is a browser-based video editor optimized for creating YouTube Shorts (9:16, vertical video). It builds on the OpenCut engine and adds Shorts-specific presets, aspect ratios, caption styles, and export workflows.

## Development

This project uses [Bun](https://bun.sh) as its package manager and [Turbo](https://turbo.build) for monorepo task orchestration.

```bash
bun install
bun run dev:web        # start the web app at localhost:3000
bun run build:web      # production build
bun test               # run all tests
```

## Architecture

See [AGENTS.md](AGENTS.md) for a full architecture walkthrough of the underlying OpenCut engine this fork is built on.

## Attribution

ShortsStudio is a fork of [OpenCut](https://github.com/OpenCut-app/OpenCut) by the OpenCut contributors.
The original work is MIT-licensed; see [LICENSE](LICENSE) for details.

## License

[MIT](LICENSE) — OpenCut contributors hold copyright on the original code; ShortsStudio additions are also released under MIT.
