# Kids Media Manager

A cross-platform desktop application built with **Tauri 2.x** (Rust backend + React/TypeScript frontend) for managing the Kids Media Player device.

## Features

- **Device Detection** - Auto-detect Raspberry Pi media player devices via USB
- **Media Library** - Browse, add, and remove video files with grid/list views
- **TMDB Metadata** - Auto-enrich video files with metadata from The Movie Database
- **Tag Management** - Assign RFID/NFC tags to media items for physical playback control
- **Parental Controls** - Configure quiet hours, daily limits, and content restrictions
- **Analytics Dashboard** - Visualize playback history with charts and statistics

## Tech Stack

### Backend (Rust)
- Tauri 2.x
- reqwest (HTTP), serde (serialization), tokio (async runtime)
- walkdir (file scanning), regex (filename parsing)
- thiserror (error handling)

### Frontend (React/TypeScript)
- React 18 + TypeScript
- Vite (build tool)
- TailwindCSS (styling)
- Zustand (state management)
- Recharts (data visualization)
- React Router (navigation)
- Lucide React (icons)

## Project Structure

```
├── src-tauri/              # Rust backend
│   └── src/
│       ├── commands/       # Tauri command handlers
│       ├── services/       # Business logic layer
│       ├── repositories/   # Data access layer
│       ├── models/         # Domain models
│       ├── utils/          # Utilities (filename parser, device detection)
│       └── error.rs        # Error types
├── src/                    # React frontend
│   ├── components/         # UI components
│   ├── hooks/              # Custom React hooks
│   ├── stores/             # Zustand state stores
│   ├── types/              # TypeScript type definitions
│   ├── pages/              # Page-level components
│   └── utils/              # Utility functions
├── package.json
└── src-tauri/Cargo.toml
```

## Usage

The app is a **single standalone binary** — no installation required. Download the binary for your platform and double-click to launch.

| Platform | Binary |
|----------|--------|
| Linux    | `kids-media-manager` |
| macOS    | `Kids Media Manager.app` |
| Windows  | `Kids Media Manager.exe` |

The entire UI is embedded inside the binary at compile time. No web server, no runtime dependencies.

## Building from Source

### Prerequisites
- [Rust](https://rustup.rs/) (latest stable)
- [Node.js](https://nodejs.org/) (18+)
- [Tauri system dependencies](https://v2.tauri.app/start/prerequisites/)

### Build the standalone binary
```bash
npm install
npm run tauri build
```

The binary will be at `src-tauri/target/release/kids-media-manager` (or `.exe` on Windows).

### Development (with hot-reload)
```bash
npm install
npm run tauri dev
```

## Architecture

The application follows clean architecture principles:

- **Repository Pattern** - Abstract data access (config, media, cache)
- **Service Layer** - Business logic separated from Tauri commands
- **Container/Presenter** - Smart containers handle data, presenters handle UI
- **Custom Hooks** - Encapsulate Tauri command invocations and state

## License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details.
