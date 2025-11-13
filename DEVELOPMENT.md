# Revolt - EV Charging Station Finder

A React Native mobile application for finding, reserving, and managing electric vehicle charging stations. Built with Expo for rapid prototyping and cross-platform development.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Expo Go app installed on your mobile device ([iOS](https://apps.apple.com/app/expo-go/id982107779) | [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))
- Git for version control

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/anneryeo/Revolt.git
   cd Revolt
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your API keys (see [Security](#-security) section)

4. **Start the development server**

   ```bash
   npm start
   ```

5. **Run on your device**
   - Scan the QR code with Expo Go (Android) or Camera app (iOS)
   - Or press `a` for Android emulator, `i` for iOS simulator

## 📱 App Flow

### User Journey

1. **Registration** → Simple welcome screen (MVP: no full auth)
2. **Add Vehicle** → Optional vehicle information
3. **Main App** → Three main sections:
   - **Map**: Find stations and plan trips
   - **Reservations**: View booking history
   - **Profile**: Manage account settings

### Map Features

- **Find Nearby Stations**: Browse charging stations by proximity
- **Station Profile**: View details, availability, pricing, amenities
- **Reserve**: Select time slot and duration
- **Plan a Trip**: Route planning with charging stops
- **Scan QR**: Start charging session (MVP: simulated)
- **Rate Experience**: Provide feedback after charging

## 🏗️ Project Structure

```
Revolt/
├── .github/
│   └── workflows/
│       └── ci.yml                 # CI/CD pipeline configuration
├── src/
│   ├── navigation/
│   │   ├── RootNavigator.tsx      # Top-level navigation
│   │   ├── MainTabsNavigator.tsx  # Bottom tab navigation
│   │   └── MapNavigator.tsx       # Map stack navigation
│   ├── screens/
│   │   ├── Auth/                  # Registration & vehicle setup
│   │   ├── Map/                   # All map-related screens
│   │   ├── Profile/               # User profile
│   │   └── Reservations/          # Booking history
│   ├── types/
│   │   ├── navigation.ts          # TypeScript type definitions
│   │   └── env.d.ts               # Environment variable types
│   └── config/                    # Configuration files (future)
├── .env.example                   # Environment variables template
├── .eslintrc.js                   # ESLint configuration
├── .prettierrc                    # Prettier configuration
├── App.tsx                        # Application entry point
├── app.json                       # Expo configuration
├── package.json                   # Dependencies and scripts
└── tsconfig.json                  # TypeScript configuration
```

## 🔧 Development

### Available Scripts

- `npm start` - Start Expo development server
- `npm run android` - Run on Android device/emulator
- `npm run ios` - Run on iOS simulator (macOS only)
- `npm run lint` - Run ESLint to check code quality
- `npm run lint:fix` - Auto-fix ESLint issues
- `npm run format` - Format code with Prettier
- `npm run type-check` - Run TypeScript type checking

### Code Quality Standards

**ESLint** automatically checks for:

- Code style consistency
- Potential bugs and errors
- React/React Native best practices
- TypeScript type safety

**Prettier** enforces:

- Consistent formatting
- 100 character line width
- Single quotes, semicolons
- 2-space indentation

### Pre-commit Checklist

```bash
npm run lint        # Check for linting errors
npm run type-check  # Verify TypeScript types
npm run format      # Format code
```

## 🤝 Collaboration Workflow

### Branch Strategy

```
main              # Production-ready code
  └── develop     # Integration branch
       └── feature/screen-name    # Feature branches
       └── bugfix/issue-name      # Bug fixes
```

### Working on a New Screen

1. **Create a feature branch**

   ```bash
   git checkout -b feature/payment-screen
   ```

2. **Make your changes**
   - Edit files in `src/screens/` or relevant directories
   - Follow existing code patterns and naming conventions
   - Add docstrings for major functions

3. **Test your changes**

   ```bash
   npm start
   # Test on Expo Go
   ```

4. **Commit with clear messages**

   ```bash
   git add .
   git commit -m "feat: add payment processing screen"
   ```

5. **Push and create Pull Request**
   ```bash
   git push origin feature/payment-screen
   ```
   Create PR on GitHub targeting `develop` branch

### Commit Message Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting)
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Maintenance tasks

**Examples:**

```bash
git commit -m "feat: add station reservation confirmation"
git commit -m "fix: resolve navigation back button issue"
git commit -m "docs: update API integration guide"
```

## 🔒 Security

### Environment Variables

**Never commit sensitive data!** All API keys and secrets must be stored in `.env` file.

**Setup:**

1. Copy `.env.example` to `.env`
2. Add your API keys:
   ```env
   GOOGLE_MAPS_API_KEY=your_actual_key_here
   API_BASE_URL=https://your-api.com
   STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
   ```
3. `.env` is in `.gitignore` and will NOT be committed

**Using environment variables in code:**

```typescript
import { GOOGLE_MAPS_API_KEY } from '@env';

// Use the key safely
const apiKey = GOOGLE_MAPS_API_KEY;
```

### Security Best Practices

✅ **DO:**

- Use `.env` for all API keys and secrets
- Keep dependencies updated (`npm audit`)
- Review code before merging PRs
- Use HTTPS for all API calls
- Validate user inputs

❌ **DON'T:**

- Hardcode API keys in source code
- Commit `.env` file to Git
- Store passwords or tokens in code
- Disable security warnings

### API Key Protection

**Google Maps API Key:**

- Restrict to specific platforms (iOS/Android)
- Set up billing alerts
- Rotate keys periodically

**Payment Keys (Stripe):**

- Use test keys for development
- Use publishable keys only (never secret keys in app)
- Implement server-side payment processing

## 🔄 CI/CD Pipeline

GitHub Actions automatically runs on every push and PR:

### Automated Checks

1. **Linting** - ESLint code quality checks
2. **Type Checking** - TypeScript validation
3. **Formatting** - Prettier style verification
4. **Security Audit** - npm audit for vulnerabilities
5. **Build Verification** - Expo configuration check

### Pipeline Status

Pipeline must pass before merging to `main` or `develop`:

- ✅ All checks passed → Ready to merge
- ❌ Checks failed → Fix issues before merging

View pipeline status in GitHub Actions tab or PR checks.

## 📚 TypeScript Guidelines

### Type Safety

All components use TypeScript for type safety:

```typescript
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MapStackParamList } from '@/types/navigation';

type Props = NativeStackScreenProps<MapStackParamList, 'StationProfile'>;

export default function StationProfileScreen({ navigation, route }: Props) {
  const { stationId } = route.params; // Type-safe!
  // ...
}
```

### Adding New Navigation Screens

1. Add route to type definition in `src/types/navigation.ts`:

   ```typescript
   export type MapStackParamList = {
     NewScreen: { userId: string }; // with params
     AnotherScreen: undefined; // no params
   };
   ```

2. Import and use in navigator:
   ```typescript
   <Stack.Screen name="NewScreen" component={NewScreenComponent} />
   ```

## 🧪 Testing (Future Enhancement)

Currently MVP focused. Future testing strategy:

- **Unit Tests**: Jest + React Native Testing Library
- **Integration Tests**: Screen navigation flows
- **E2E Tests**: Detox for end-to-end testing
- **Visual Tests**: Storybook for component library

## 📦 Building for Production

### Expo EAS Build (Recommended)

1. Install EAS CLI:

   ```bash
   npm install -g eas-cli
   ```

2. Login to Expo:

   ```bash
   eas login
   ```

3. Configure build:

   ```bash
   eas build:configure
   ```

4. Build for platforms:
   ```bash
   eas build --platform android
   eas build --platform ios
   ```

### Environment-Specific Builds

- Development: Use `.env` file
- Staging: Use `.env.staging`
- Production: Use `.env.production`

## 🐛 Troubleshooting

### Common Issues

**Metro bundler cache issues:**

```bash
npx expo start --clear
```

**Dependencies not installing:**

```bash
rm -rf node_modules package-lock.json
npm install
```

**Type errors after adding dependencies:**

```bash
npm run type-check
```

**Expo Go connection issues:**

- Ensure phone and computer are on same network
- Disable VPN if active
- Try tunnel mode: `npx expo start --tunnel`

## 📄 License

This project is private and proprietary to Revolt.

## 👥 Team

- **Repository Owner**: anneryeo
- **Contributors**: [Add team members]

## 🔗 Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/)
- [React Native Docs](https://reactnative.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

**Ready to build?** Start the development server: `npm start` 🚀
