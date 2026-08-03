# ADR-0004 — Platform toolchain: Expo (managed workflow)

Status: **Accepted**

## Context
The stack is React Native + TypeScript (fixed). The docs are silent on Expo
vs bare CLI. Host is Windows, timebox is 72h, and the deliverables include a
screen recording plus release-build perf numbers.

## Decision
Use **Expo** (TypeScript template). TypeScript, Jest, ESLint are first-class;
`expo run:android` produces a release build for PERF.md measurement; a dev
client preserves the native escape hatch if we ever need a native module.

## Consequences
- Fastest path from zero to a recording on Windows — the timebox's real risk.
- Perf methodology still honest: release build, stated device, multiple runs.
- The renderer's depth (registry, dispatcher, fallback) is what's graded, and
  that's toolchain-agnostic.

## Alternatives rejected
- Bare `react-native` CLI — heavier Windows setup (Android SDK, emulator,
  Gradle) with no grading upside on this rubric.
