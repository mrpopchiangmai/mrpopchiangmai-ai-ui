# mrpopchiangmai-ai-ui

AI-native web UI for **Mr. Pop Chiang Mai** motor and car rental (`mrpopchiangmai.com`).

---

## 🚀 Overview

`mrpopchiangmai-ai-ui` is an AI-powered rental booking interface designed for tourists and travelers in Chiang Mai, Thailand. It combines natural language vehicle searching, interactive price calculations, vision-based identity document verification, and WhatsApp instant booking.

### Key Features

- **Conversational Search & Intent Matching**: Search fleet inventory using natural language (e.g., *"touring bike for 3 days on Mae Hong Son Loop"*).
- **CopilotKit AG-UI Integration**: Embedded AI Copilot Popup powered by `@copilotkit/react-core` and `@copilotkit/react-ui` for real-time assistant queries and automated UI filtering.
- **Vision AI Document Verification**: Simulates AI document scanning and validation for driving licenses and passports prior to checkout.
- **Dynamic Fleet Catalog**: Comprehensive inventory of motorbikes, scooters, adventure bikes, and touring accessories with real-time rate calculations.
- **Multi-Currency Support**: Instant toggle between Thai Baht (THB ฿) and US Dollars (USD $).
- **Instant WhatsApp Booking**: Generates pre-filled WhatsApp booking links directly to Mr. Pop Chiang Mai's reservation desk.

---

## 🛠️ Tech Stack

- **Frontend Framework**: React 18 + Vite
- **Styling**: Tailwind CSS, PostCSS, Autoprefixer
- **AI Protocol**: CopilotKit (`@copilotkit/react-core`, `@copilotkit/react-ui`, `@copilotkit/runtime`)
- **Icons & FX**: Lucide React, Canvas Confetti
- **Dev Middleware**: Custom Vite plugin running `@copilotkit/runtime` Node HTTP endpoint

---

## 📁 Project Structure

```
mrpopchiangmai-ai-ui/
├── public/                 # Static assets (favicons, images)
├── src/
│   ├── components/         # React UI components
│   │   ├── Header.jsx                # Header, navigation, currency toggle
│   │   ├── ConversationalSearch.jsx  # AI query search bar & category chips
│   │   ├── VehicleCard.jsx           # Bike card display & booking triggers
│   │   ├── VisionAiVerification.jsx  # License / Passport scanning modal
│   │   ├── CheckoutModal.jsx         # Booking summary & WhatsApp redirect
│   │   ├── LlmTxtModal.jsx           # llms.txt standard viewer modal
│   │   └── Footer.jsx                # Footer, shop info & locations
│   ├── data/
│   │   └── fleet.js        # Vehicle inventory dataset & pricing rules
│   ├── services/
│   │   ├── ai.js           # AI intent resolution & query processing
│   │   └── eval.js         # AI query evaluation utilities
│   ├── App.jsx             # Root component, CopilotKit actions & state
│   ├── main.jsx            # React DOM entry point
│   └── index.css           # Global styles & Tailwind imports
├── index.html              # HTML entry template
├── vite.config.js          # Vite configuration & CopilotRuntime plugin
├── package.json            # Dependencies & scripts
└── README.md               # Project documentation
```

---

## ⚡ Getting Started

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm** or **yarn** / **pnpm**

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/mrpopchiangmai-coder/mrpopchiangmai-ai-ui.git
   cd mrpopchiangmai-ai-ui
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start local development server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

---

## ⚙️ Development & Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts Vite dev server with CopilotKit runtime at `http://localhost:5173` |
| `npm run build` | Builds production-optimized bundle to `dist/` |
| `npm run preview` | Previews production build locally |

---

## 🤖 CopilotKit & AG-UI Architecture

The app uses CopilotKit to make the vehicle inventory readable to AI agents and expose interactive actions:

1. **`useCopilotReadable`**: Registers `FLEET_DATA` into the agent's context.
2. **`useCopilotAction` (`calculateMotorbikeRentalPrice`)**: Allows the AI assistant to calculate rental rates and dynamically filter the UI based on user prompts.
3. **Embedded Vite Middleware**: `vite.config.js` embeds `copilotRuntimeNodeHttpEndpoint` serving `/api/copilotkit` directly inside the Vite dev server for seamless local development.

---

## 📄 License & Ownership

Developed for **Mr. Pop Chiang Mai Motor & Car Rental** (`mrpopchiangmai.com`).
All rights reserved.
