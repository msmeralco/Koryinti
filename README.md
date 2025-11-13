# Revolt ⚡

**EV Charging Station Finder & Reservation System**

A React Native mobile application built with Expo that helps electric vehicle owners find nearby charging stations, plan trips with charging stops, and manage reservations seamlessly.

---

## 🎯 Project Status: MVP Development

This is an **MVP (Minimum Viable Product)** focused on core functionality and collaboration infrastructure. The project emphasizes:
- ✅ Clean code architecture
- ✅ Type-safe TypeScript implementation
- ✅ Automated CI/CD pipelines
- ✅ Security best practices
- ✅ Branch-based collaboration workflow

---

## ✨ Features

### Current MVP Features
- 📍 **Find Nearby Stations** - Browse charging stations by proximity
- 🗺️ **Trip Planning** - Plan routes with suggested charging stops
- 📅 **Reservations** - Reserve charging slots at stations
- ⭐ **Ratings** - Rate charging experiences
- 👤 **User Profile** - Manage vehicles and payment methods
- 📱 **Expo Go Ready** - Instant testing on physical devices

### Planned Features
- Real-time station availability
- Payment integration (Stripe)
- Push notifications for reservations
- Advanced route optimization
- Multi-vehicle support
- Social features & reviews

---

## 🚀 Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/anneryeo/Revolt.git
cd Revolt

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your API keys

# Start development server
npm start
```

### Run on Device
1. Install **Expo Go** on your phone ([iOS](https://apps.apple.com/app/expo-go/id982107779) | [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))
2. Scan QR code from terminal
3. Start testing!

---

## 📱 App Flow Overview

```
┌─────────────────┐
│  Registration   │  → Simple welcome (no auth for MVP)
└────────┬────────┘
         ↓
┌─────────────────┐
│  Add Vehicle    │  → Optional vehicle info
└────────┬────────┘
         ↓
┌─────────────────────────────────────┐
│          Main App (Tabs)            │
├─────────┬──────────────┬────────────┤
│   Map   │ Reservations │  Profile   │
└─────────┴──────────────┴────────────┘
     ↓
Map Flow:
1. Find Nearby Stations → Station List
2. Select Station → Station Profile (Details, Reserve, Directions)
3. Reserve → Confirm Payment
4. Active Reservation → Scan QR → Start Charging
5. Complete Session → Rate Experience

Trip Planning Flow:
1. Plan a Trip → Enter From/To locations
2. View Suggested Route → See charging stops
3. Reserve Chargers → Multi-station booking
4. Track Reservation → Manage stops
```

---

## 🏗️ Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | React Native + Expo |
| **Language** | TypeScript |
| **Navigation** | React Navigation v6 |
| **Maps** | React Native Maps |
| **State Management** | React Hooks (Context API for future) |
| **Code Quality** | ESLint + Prettier |
| **CI/CD** | GitHub Actions |
| **Testing** | Jest (planned) |

---

## 📂 Project Structure

```
Revolt/
├── src/
│   ├── navigation/       # Navigation configuration
│   ├── screens/          # Screen components by feature
│   │   ├── Auth/         # Registration, Add Vehicle
│   │   ├── Map/          # 10 map-related screens
│   │   ├── Profile/      # User profile
│   │   └── Reservations/ # Booking history
│   └── types/            # TypeScript definitions
├── .github/workflows/    # CI/CD pipelines
├── .vscode/              # Editor configuration
├── App.tsx               # Entry point
└── DEVELOPMENT.md        # Detailed dev guide
```

---

## 🤝 Contributing

We follow a structured Git workflow for collaboration:

### Branch Strategy
- `main` - Production code
- `develop` - Integration branch
- `feature/*` - New features
- `bugfix/*` - Bug fixes

### Workflow
```bash
# 1. Create feature branch
git checkout -b feature/my-feature

# 2. Make changes and test
npm start

# 3. Run quality checks
npm run lint
npm run type-check

# 4. Commit with convention
git commit -m "feat: add new feature"

# 5. Push and create PR
git push origin feature/my-feature
```

**See [DEVELOPMENT.md](./DEVELOPMENT.md) for detailed guidelines.**

---

## 🔒 Security

### Environment Variables
All sensitive data stored in `.env` (never committed):
```env
GOOGLE_MAPS_API_KEY=your_key
API_BASE_URL=https://api.example.com
STRIPE_PUBLISHABLE_KEY=pk_test_xxx
```

### Security Features
- ✅ Environment-based configuration
- ✅ `.env` in `.gitignore`
- ✅ Automated security audits in CI/CD
- ✅ No hardcoded secrets
- ✅ Secret scanning with TruffleHog

---

## 🔄 CI/CD Pipeline

Every push and PR automatically runs:
- ✅ ESLint code quality checks
- ✅ TypeScript type validation
- ✅ Prettier formatting verification
- ✅ npm security audit
- ✅ Expo configuration check
- ✅ Secret scanning

**Pipeline must pass before merging.**

---

## 📚 Documentation

- **[DEVELOPMENT.md](./DEVELOPMENT.md)** - Complete development guide
  - Setup instructions
  - Coding standards
  - Collaboration workflow
  - Troubleshooting
  - Security practices

---

## 🛠️ Development Scripts

```bash
npm start          # Start Expo dev server
npm run android    # Run on Android
npm run ios        # Run on iOS
npm run lint       # Check code quality
npm run lint:fix   # Auto-fix issues
npm run format     # Format code
npm run type-check # TypeScript validation
```

---

## 📖 Screen Reference

| Screen | Purpose | Navigation |
|--------|---------|------------|
| Registration | Welcome screen | → AddVehicle |
| AddVehicle | Vehicle setup | → MainTabs |
| MapHome | Main map view | → NearbyStations / PlanTrip |
| NearbyStations | Station list | → StationProfile |
| StationProfile | Station details | → ReserveStation |
| ReserveStation | Time/duration picker | → ConfirmPayment |
| ConfirmPayment | Payment screen | → ReservationDetails |
| PlanTrip | Route input | → TripRoute |
| TripRoute | Route with stops | → ReservationDetails |
| ReservationDetails | Active booking | → ScanQR |
| ScanQR | QR code scanner | → Rating |
| Rating | Post-session feedback | → MapHome |
| Profile | User settings | - |
| Reservations | Booking history | - |

---

## 🎨 Code Style

- **TypeScript**: Strict mode enabled
- **Components**: Functional components with hooks
- **Documentation**: Docstrings for major functions
- **Naming**: PascalCase for components, camelCase for functions
- **No comments**: Prefer self-documenting code and docstrings

Example:
```typescript
/**
 * StationProfileScreen displays detailed information about a charging station
 * including address, amenities, pricing, and available actions.
 */
export default function StationProfileScreen({ navigation, route }: Props) {
  // Implementation
}
```

---

## 🐛 Known Issues / MVP Limitations

- ⚠️ Mock data for stations (no backend integration)
- ⚠️ Simulated QR scanning (no camera access)
- ⚠️ Placeholder payment flow (no Stripe integration)
- ⚠️ No real-time availability updates
- ⚠️ Simplified authentication (no user accounts)

**These are intentional MVP constraints. Full features planned for future releases.**

---

## 📞 Support

For questions or issues:
1. Check [DEVELOPMENT.md](./DEVELOPMENT.md) troubleshooting section
2. Review existing GitHub Issues
3. Create new issue with detailed description
4. Contact repository owner: [@anneryeo](https://github.com/anneryeo)

---

## 📄 License

Private and proprietary to Revolt.

---

## 🙏 Acknowledgments

Built with:
- [Expo](https://expo.dev/) - React Native framework
- [React Navigation](https://reactnavigation.org/) - Navigation library
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [ESLint](https://eslint.org/) + [Prettier](https://prettier.io/) - Code quality

---

**Ready to contribute?** Read [DEVELOPMENT.md](./DEVELOPMENT.md) and start coding! 🚀