# System Architecture — mrpopchiangmai-ai-ui

This document provides a technical overview of the `mrpopchiangmai-ai-ui` application architecture, data flow, component hierarchy, and CopilotKit integration.

---

## 1. System Overview

`mrpopchiangmai-ai-ui` is built as a single-page React application (SPA) powered by Vite. It serves as the AI-native customer frontend for Mr. Pop Chiang Mai motor and car rental services.

```
┌────────────────────────────────────────────────────────────────────────┐
│                          User Browser / Client                         │
│                                                                        │
│  ┌───────────────────────┐              ┌───────────────────────────┐  │
│  │   MrPopRentalApp      │◄────────────►│ CopilotKit (@copilotkit)  │  │
│  │ (React State & Views) │              │  useCopilotAction / Read  │  │
│  └───────────┬───────────┘              └─────────────┬─────────────┘  │
└──────────────┼────────────────────────────────────────┼────────────────┘
               │                                        │
               │ HTTP Requests                          │ /api/copilotkit
               ▼                                        ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      Vite Dev Server / Node Host                       │
│                                                                        │
│  ┌───────────────────────┐              ┌───────────────────────────┐  │
│  │   Vite Static Server  │              │ CopilotRuntime Middleware │  │
│  │  (JS/CSS/Assets)      │              │ (copilotRuntimeVitePlugin)│  │
│  └───────────────────────┘              └───────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Component Hierarchy

- **`App.jsx`**: Root component wrapping `<MrPopRentalApp />` with `<CopilotKit runtimeUrl="/api/copilotkit">`.
  - **`Header`**: Navigation bar, brand logo, currency selector (`THB` / `USD`), shop status badge.
  - **`ConversationalSearch`**: Natural language search input, quick prompt triggers, category filter tabs.
  - **`VehicleCard`**: Fleet item display card showing bike specifications, pricing per duration (1-3 days, 4-7 days, 8+ days), badges, and booking trigger button.
  - **`VisionAiVerification`**: Modal simulating AI identity verification (driving license / passport upload, automatic extraction of document numbers & country).
  - **`CheckoutModal`**: Final checkout step calculating deposit, total rental price, rental duration, pickup locations, and generating the pre-formatted WhatsApp booking link.
  - **`LlmTxtModal`**: Modal displaying standard `llms.txt` format documentation for AI web crawlers.
  - **`Footer`**: Store operating hours, address details, contact numbers, and social links.

---

## 3. Data Flow & State Management

### 3.1 Fleet Data (`src/data/fleet.js`)
The vehicle catalog is stored in `fleet.js` as an array of vehicle objects:
```javascript
{
  id: 'honda-click-125',
  name: 'Honda Click 125cc',
  category: 'City Scooters',
  type: 'Automatic Scooter',
  engine: '124.8 cc',
  power: '11.1 hp',
  rates: { day1_3: 250, day4_7: 220, day8plus: 200 },
  depositThb: 1000,
  image: '...',
  badges: ['Popular', 'Fuel Efficient', 'City Best-Seller'],
  suitability: 'Ideal for Chiang Mai city riding, Nimman, and Old City'
}
```

### 3.2 Filtering & Natural Language Search
`App.jsx` computes `filteredFleet` via `useMemo`:
1. **Category Filter**: Matches `activeCategory` ('All', 'Adventure Bikes', 'Premium Scooters', 'City Scooters', etc.).
2. **Text Query Filter**: Matches user search input against vehicle `name`, `category`, `type`, `suitability`, `badges`, and model key phrases (e.g. `scrambler`, `nmax`, `vstrom`, `transalp`).

---

## 4. CopilotKit Integration

### 4.1 Exposing State (`useCopilotReadable`)
`useCopilotReadable` exposes `FLEET_DATA` to the AI assistant so it has full knowledge of current models, rates, and deposit terms.

### 4.2 Handling Actions (`useCopilotAction`)
The action `calculateMotorbikeRentalPrice` allows the CopilotKit assistant to programmatically update the user's active search query and category state, and calculate quotes for specific rental durations.

### 4.3 Runtime Backend (`vite.config.js`)
`vite.config.js` defines `copilotRuntimeVitePlugin()`, which intercepts requests to `/api/copilotkit` using `copilotRuntimeNodeHttpEndpoint` and routes them through a local `CopilotRuntime` instance registered with a default `MrPopUiAgent`.

---

## 5. Adding New Vehicles to Fleet

To add a new vehicle to the catalog:
1. Open `src/data/fleet.js`.
2. Append a new vehicle object to `FLEET_DATA` following the existing schema.
3. Save the file — Vite Hot Module Replacement (HMR) will instantly update the UI and CopilotKit readable state.
