<p align="center">
  <img src="./icon.png" alt="Measure Fitness" width="120"/>
</p>

<h1 align="center">Measure Fitness</h1>
<p align="center">
  <strong>Offline-first React Native fitness tracker built with Expo</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Expo-54-blue?logo=expo&labelColor=black" alt="Expo SDK 54"/>
  <img src="https://img.shields.io/badge/React_Native-0.76-blue?logo=react&labelColor=black" alt="React Native 0.76"/>
  <img src="https://img.shields.io/badge/TypeScript-5.3-3178C6?logo=typescript&labelColor=black" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/license-MIT-green" alt="MIT License"/>
  <img src="https://img.shields.io/badge/privacy-offline--first-34C759" alt="Offline First"/>
</p>

---

## Overview

Measure Fitness is a **privacy-first, offline fitness tracker** that lets you log body measurements, track workouts, set personal records, and monitor progress — all without an account or internet connection. Your data stays on your device.

---

## Features

| Feature | Description |
|---|---|
| **Body Measurements** | Log weight, body fat, muscle mass, and track changes over time |
| **Workout Calendar** | Schedule routines and mark completions on an interactive calendar |
| **Personal Records** | Track max lifts for bench press, deadlift, squat, and more |
| **Workout Sessions** | Guided workout mode with set tracking and rest timer |
| **Fitness Goals** | Set targets and visualize progress |
| **Achievements** | Earn badges for reaching milestones |
| **Dark Mode** | Light, dark, or system-following theme |
| **Onboarding Wizard** | Guided first-launch setup for new users |
| **100% Offline** | All data persisted locally via AsyncStorage |
| **No Account Required** | No sign-up, no login, no cloud — your data stays yours |

---

## Screenshots

<p align="center">
  <i>Screenshots coming soon</i>
</p>

---

## Getting Started

### Prerequisites

- Node.js 18+
- `npm` or `yarn`
- Expo Go app (iOS/Android) or an emulator for native testing

### Installation

```bash
# Clone the repository
git clone https://github.com/Prince000101/Mesure_Fittness_app.git
cd Mesure_Fittness_app

# Install dependencies
npm install

# Start the development server
npx expo start
```

### Running the App

| Platform | Command | Notes |
|---|---|---|
| Web | `npx expo start --web` | Quickest way to preview |
| iOS (Expo Go) | `npx expo start` then scan QR | Requires Expo Go app |
| Android (Expo Go) | `npx expo start` then scan QR | Requires Expo Go app |
| iOS Simulator | `npx expo start --ios` | macOS + Xcode required |
| Android Emulator | `npx expo start --android` | Android Studio required |

### Verification

```bash
# TypeScript type checking
npx tsc --noEmit

# Web export (static build)
npx expo export --platform web
```

---

## Onboarding Flow

First-time users are guided through a 4-step wizard:

1. **Welcome** -- App introduction with feature highlights
2. **Your Info** -- Name, age, height, and fitness level selection
3. **Measurements** -- Starting weight and optional body fat percentage
4. **Your Plan** -- Optional max lift entries for key exercises

All onboarding data is saved directly to your device — no servers involved.

---

## Project Structure

```
Mesure_Fittness_app/
├── app/                        # Expo Router pages (file-based routing)
│   ├── (tabs)/                 # Bottom tab navigator
│   │   ├── index.tsx           # Home dashboard (stats summary)
│   │   ├── workouts.tsx        # Workout calendar
│   │   └── profile.tsx         # User profile & settings
│   ├── onboarding.tsx          # First-launch wizard
│   ├── workout-session.tsx     # Active workout with timer
│   ├── personal-records.tsx    # Personal bests
│   ├── body-measurements.tsx   # Measurement history
│   ├── fitness-goals.tsx       # Goal tracking
│   ├── achievements.tsx        # Badge collection
│   ├── create-workout-routine.tsx  # Routine builder
│   ├── exercise-library.tsx    # Exercise catalog
│   ├── workout-details.tsx     # Routine detail view
│   ├── progress.tsx            # Progress charts/stats
│   └── _layout.tsx             # Root layout + onboarding gate
├── components/                 # Reusable UI components
├── contexts/                   # React Context providers
│   ├── ThemeContext.tsx         # Dark/light/system theme
│   └── WorkoutContext.tsx      # Core data state & persistence
├── utils/
│   └── storage.ts              # AsyncStorage read/write helpers
├── types/                      # TypeScript type definitions
├── app.json                    # Expo configuration
├── package.json
└── tsconfig.json
```

---

## Tech Stack

| Technology | Purpose |
|---|---|
| **React Native** 0.76 | Cross-platform mobile framework |
| **Expo SDK 54** | Development toolchain & managed workflow |
| **Expo Router** (file-based) | Navigation with deep linking support |
| **AsyncStorage** | Local persistent key-value storage |
| **TypeScript** | Type safety throughout |
| **lucide-react-native** | Consistent icon system |
| **expo-linear-gradient** | Visual gradients & styling |
| **reanimated** | Smooth animations |

---

## Data & Privacy

- **All data is stored locally** on your device using AsyncStorage
- **No accounts, no logins, no cloud sync**
- **No data leaves your device**
- Use the app's profile settings to reset or clear your data at any time
- Built for users who value privacy and offline reliability

---

## Development

```bash
# Watch TypeScript for errors
npx tsc --noEmit --watch

# Export static web build
npx expo export --platform web

# Clear Metro cache (if you run into issues)
npx expo start -c

# Check for dependency updates
npx expo install --fix
```

---

## Author

**Prince Kumar**

<p>
  <a href="https://github.com/Prince000101">
    <img src="https://img.shields.io/badge/GitHub-Prince000101-181717?logo=github&labelColor=black" alt="GitHub"/>
  </a>
  <a href="https://www.linkedin.com/in/prince-kumar-41659823b">
    <img src="https://img.shields.io/badge/LinkedIn-Prince_Kumar-0A66C2?logo=linkedin&labelColor=black" alt="LinkedIn"/>
  </a>
</p>

---

## License

Distributed under the MIT License. See `LICENSE` for more information.
