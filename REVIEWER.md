# Reviewer Guide — Cars24 SDUI Assessment

**Repo:** https://github.com/Aakash007-ai/expo-monorepo.git

---

## Quick Start

### Prerequisites
- Node.js >= 20.x
- npm >= 10.x
- Git

### 1. Clone
```bash
git clone https://github.com/Aakash007-ai/expo-monorepo.git
cd expo-monorepo
```

### 2. Install
```bash
npm install
```

### 3. Run typecheck
```bash
npm run typecheck
```

### 4. Run tests
```bash
npm test
```

### 5. Start the app
```bash
npm start
```
Expo will print a QR code. Scan it with **Expo Go** (iOS/Android) or press `a` for Android emulator / `i` for iOS simulator.

---

## Project Structure

```
expo-monorepo/
├── apps/mobile/              # Expo app (the SDUI client)
├── packages/sdui-core/       # Generic SDUI engine
├── docs/                     # ADRs, glossary, project docs
└── README.md
```

## What to Look For

- **App** (`apps/mobile/`): Renders the Cars24 home page entirely from a JSON payload. No hardcoded sections.
- **Documentation**: `README.md`, `CLAUDE.md`, `docs/` — architecture decisions, glossary, AI workflow log.
- **Tests**: Engine unit tests in `packages/sdui-core/src/`.

## Common Issues

| Problem | Fix |
|---|---|
| `npm install` fails with peer-dep errors | Run `npm install` again — peer deps should resolve after first pass |
| Port 8081 already in use | Kill the process: `npx kill-port 8081` |
| QR code not scanning | Ensure phone and laptop are on the same Wi-Fi. Or use `npx expo start --tunnel` |
