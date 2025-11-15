# OverTabbed - Tab Manager Browser Extension

A modern Chrome browser extension built with TypeScript and React that provides an intuitive and visual way to manage all your browser tabs, groups, and windows.

## Features

- 📑 **Visual Tab Management**: View all tabs across all windows in one place
- 📌 **Pin/Unpin Tabs**: Quickly pin important tabs
- 🗂️ **Group Management**: Organize tabs into groups and manage them visually
- 🔄 **Drag and Drop**: Reorder tabs within windows or move them between windows
- 🔊 **Audio Controls**: Mute/unmute tabs with audio
- 🪟 **Window Overview**: See all windows at a glance
- ✨ **Modern UI**: Beautiful, intuitive interface built with React and CSS modules

## Tech Stack

- **TypeScript** (latest)
- **React 18** (latest)
- **Vite** (build tool)
- **pnpm** (package manager)
- **CSS Modules** (component-scoped styling)
- **React DnD** (drag and drop)
- **Jest** (unit testing)
- **Playwright** (E2E testing)

## Project Structure

```
overtabbed-browser-extension/
├── src/
│   ├── components/          # React components
│   │   ├── TabItem/         # Individual tab component
│   │   ├── GroupItem/       # Tab group component
│   │   └── WindowItem/      # Window component
│   ├── services/            # Business logic services
│   │   ├── tabService.ts    # Tab operations
│   │   ├── groupService.ts  # Group operations
│   │   └── windowService.ts # Window operations
│   ├── types/               # Domain models
│   │   ├── tab.ts           # Tab domain model
│   │   ├── group.ts         # Group domain model
│   │   └── window.ts        # Window domain model
│   ├── background/          # Background service worker
│   ├── App.tsx              # Main app component
│   └── main.tsx             # Entry point
├── public/
│   └── manifest.json        # Chrome extension manifest
├── tests/
│   └── e2e/                 # Playwright E2E tests
└── dist/                    # Build output (for Chrome)

```

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (install via `npm install -g pnpm`)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd overtabbed-browser-extension
```

2. Install dependencies:
```bash
pnpm install
```

### Development

1. Build the extension in development mode:
```bash
pnpm dev
```

This will watch for changes and rebuild automatically.

2. Build for production:
```bash
pnpm build
```

This creates optimized files in the `dist` folder.

### Loading the Extension in Chrome

1. **Add Extension Icons** (optional but recommended):
   - Create icon files: `icon16.png`, `icon48.png`, and `icon128.png`
   - Place them in the `public/icons/` directory
   - If you don't add icons, the extension will still work but may show a default icon

2. Build the extension:
   ```bash
   pnpm build
   ```

3. Open Chrome and navigate to `chrome://extensions/`
4. Enable "Developer mode" using the toggle in the top-right corner
5. Click "Load unpacked"
6. Select the `dist` folder from this project
7. Click the extension icon in the toolbar to open the tab manager

## Testing

### Unit Tests (Jest)

Run unit tests:
```bash
pnpm test
```

Run tests in watch mode:
```bash
pnpm test:watch
```

### E2E Tests (Playwright)

Run end-to-end tests:
```bash
pnpm test:e2e
```

## Code Quality

The project follows key programming principles:

- **DRY (Don't Repeat Yourself)**: Reusable services and components
- **KISS (Keep It Simple, Stupid)**: Simple, straightforward code
- **SOLID Principles**: 
  - Single Responsibility: Each service handles one concern
  - Open/Closed: Extensible through composition
  - Liskov Substitution: Proper interface usage
  - Interface Segregation: Focused interfaces
  - Dependency Inversion: Services depend on abstractions

## Domain Models

The extension uses well-defined domain models:

- **Tab**: Represents a browser tab with properties like id, title, url, pinned status, etc.
- **Group**: Represents a tab group with color, title, and associated tabs
- **Window**: Represents a browser window containing tabs and groups

## Available Scripts

- `pnpm dev` - Build in development mode with watch
- `pnpm build` - Build for production
- `pnpm test` - Run Jest unit tests
- `pnpm test:watch` - Run tests in watch mode
- `pnpm test:e2e` - Run Playwright E2E tests
- `pnpm lint` - Run ESLint
- `pnpm type-check` - Run TypeScript type checking

## License

This project is licensed under the Creative Commons Attribution-NonCommercial 4.0 International License (CC BY-NC 4.0). 

This means:
- ✅ You can use, share, and modify the code
- ✅ You must give appropriate credit
- ❌ You cannot use it for commercial purposes without authorization

See the [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please ensure your code follows the project's coding standards and includes appropriate tests.

## Browser Compatibility

- Chrome 88+ (Manifest V3)
- Chromium-based browsers (Edge, Brave, etc.)
