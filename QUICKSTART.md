# Quick Start Guide

## Get Up and Running in 5 Minutes

### Step 1: Install Dependencies (2 min)

```bash
npm install
```

This installs all required packages including:

- Expo SDK
- React Navigation
- TypeScript
- ESLint & Prettier
- React Native Maps

### Step 2: Environment Setup (1 min)

```bash
# Copy environment template
cp .env.example .env
```

**For MVP testing, you can use placeholder values:**

```env
GOOGLE_MAPS_API_KEY=demo_key_here
API_BASE_URL=https://api.example.com
STRIPE_PUBLISHABLE_KEY=pk_test_demo
```

> For production, get real API keys from:
>
> - [Google Maps Platform](https://developers.google.com/maps)
> - [Stripe Dashboard](https://dashboard.stripe.com/)

### Step 3: Start Development Server (30 sec)

```bash
npm start
```

This will:

- Start Metro bundler
- Show QR code in terminal
- Open browser with Expo DevTools

### Step 4: Run on Your Phone (1 min)

**iOS:**

1. Install [Expo Go](https://apps.apple.com/app/expo-go/id982107779)
2. Open Camera app
3. Scan QR code from terminal
4. App opens in Expo Go

**Android:**

1. Install [Expo Go](https://play.google.com/store/apps/details?id=host.exp.exponent)
2. Open Expo Go app
3. Scan QR code from terminal
4. App loads automatically

### Step 5: Verify Installation (30 sec)

You should see:

1. Welcome screen with "Welcome to Revolt"
2. "Get Started" button
3. Tap button → Add Vehicle screen
4. Skip → Main app with Map, Reservations, Profile tabs

---

## First Time Setup Complete!

### What's Next?

#### Explore the App Flow

1. Navigate to Map tab
2. Tap "Find Nearby Stations"
3. Select a station
4. Try the "Reserve" flow
5. Test "Plan a Trip" feature

#### Start Development

```bash
# Create your feature branch
git checkout -b feature/my-feature

# Make changes to screens in src/screens/

# Test in real-time (changes auto-refresh)
# Shake device to open developer menu
```

#### Code Quality Check

```bash
# Run linting
npm run lint

# Fix auto-fixable issues
npm run lint:fix

# Check types
npm run type-check

# Format code
npm run format
```

---

## Troubleshooting

### "Unable to connect to Metro"

```bash
# Clear cache and restart
npx expo start --clear
```

### "Module not found"

```bash
# Reinstall dependencies
rm -rf node_modules
npm install
```

### "Type errors"

```bash
# Check if all dependencies installed
npm install

# Run type check
npm run type-check
```

### Can't scan QR code

- Ensure phone and computer on same WiFi
- Try tunnel mode: `npx expo start --tunnel`
- Or manually enter URL in Expo Go

---

## Development Tips

### Hot Reloading

- Changes auto-refresh on save
- Shake device → "Reload" for manual refresh
- Shake device → "Debug" to open Chrome DevTools

### Debugging

- `console.log()` appears in terminal
- Shake device → "Debug JS Remotely" for Chrome DevTools
- Use React DevTools browser extension

### VS Code Setup

1. Install recommended extensions (prompt appears)
2. Enable format on save (already configured)
3. Use TypeScript hints (Cmd/Ctrl + Space)

---

## Next Steps

- Read [DEVELOPMENT.md](./DEVELOPMENT.md) for detailed guide
- Check [CONTRIBUTING.md](./CONTRIBUTING.md) for workflow
- Explore screen files in `src/screens/`
- Review navigation in `src/navigation/`

---

**Happy coding!** Questions? See [DEVELOPMENT.md](./DEVELOPMENT.md) troubleshooting section.
