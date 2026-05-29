# Smart Weather & Farming Advisory App (UI Dashboard)

A modern, responsive **React + TypeScript** dashboard UI for a “Smart Weather & Farming Advisory App”.

It’s designed to feel like a **real-time, data-driven dashboard**: when you search for a new location (e.g., *Pune, Delhi, Mumbai*), **all sections update together** with a smooth loading shimmer/transition.

> Note: This project currently **simulates weather data** (deterministic per location) so the UI works without API keys. It’s ready to be connected to a real weather API later.

## Features

- **Dynamic header**
  - Location search (city/village)
  - GPS button (auto-detect using browser geolocation; falls back to a sample city if permission is denied)
  - Refresh button
  - “Last updated” time + full timestamp
  - Selected location shown prominently

- **Main Weather Card**
  - Large temperature display
  - Condition + changing icon
  - Feels-like temperature
  - Min / Max
  - Condition-aware background gradient

- **Weather Metrics Row**
  - Humidity
  - Wind speed
  - Cloud coverage
  - Pressure

- **Smart Farming Conditions (logic-based + color-coded)**
  - Irrigation status
  - Planting suitability
  - Pest risk
  - Drought risk
  - Severity colors:
    - Green: `#4CAF50` (Good)
    - Yellow: `#FFA726` (Moderate/Caution)
    - Red: `#EF5350` (Risk)

- **AI-based Farming Recommendations**
  - Contextual advice generated from current conditions
  - Example behaviors:
    - Rainy/Stormy → reduce irrigation + drainage
    - Hot → avoid noon spraying
    - Stable → good for routine farm ops / harvesting windows

- **5-day Forecast**
  - Horizontally scrollable cards
  - Day label, icon, min/max, condition

- **Interactive Chatbot Assistant**
  - Floating chat button
  - Ask questions like:
    - “Should I irrigate today?”
    - “Is it good for sowing?”
    - “Any alerts?”
  - Answers are based on the **current dashboard state** (weather + farming logic + alerts)

- **Alerts & Notifications**
  - Heavy rain / storm / heatwave / frost style warnings
  - If no hazards, shows “No major alerts”

- **Farmer Diary / Notes**
  - Add notes per location
  - Notes persist in `localStorage`
  - Each location has its own diary history

## Tech Stack

- **Frontend**: React + TypeScript (Vite)
- **Styling**: Tailwind CSS v4 (via Vite plugin)
- **State**: React hooks (`useState`, `useMemo`, `useEffect`)
- **Storage**: Browser `localStorage` for diary entries

## Getting Started

### Prerequisites

- Node.js 18+ (works with Node 22 as well)
- npm

### Install

```bash
npm install
```

### Run (Dev)

```bash
npm run dev
```

Vite will print the local URL (usually `http://localhost:5173`).

### Build (Production)

```bash
npm run build
```

### Preview production build

```bash
npm run preview
```

## How “dynamic updates” work

All UI sections are driven by a single shared model created from the selected location:

- When you search/GPS/refresh, the app:
  - shows **loading shimmer**
  - waits ~700ms to simulate network fetch
  - updates the location query
  - rebuilds the dashboard model
  - updates “Last updated”

The model is generated in:

- `src/lib/dashboardModel.ts`

It combines:

- `src/lib/weatherSim.ts`: deterministic weather + metrics + forecast per location
- `src/lib/farmingLogic.ts`: irrigation/planting/pest/drought logic + recommendations
- `src/lib/alerts.ts`: hazard-style alert generation

## Project Structure

```
src/
  components/
    Header.tsx
    ForecastRow.tsx
    Diary.tsx
    Chatbot.tsx
    panels/
      WeatherCard.tsx
      MetricsRow.tsx
      FarmingConditionsPanel.tsx
      RecommendationsPanel.tsx
      AlertsPanel.tsx
    ui/
      Card.tsx
      Skeleton.tsx
      shimmer.css
  lib/
    dashboardModel.ts
    weatherSim.ts
    farmingLogic.ts
    alerts.ts
    chatbot.ts
    seed.ts
  types.ts
  App.tsx
  main.tsx
  index.css
```

## Customization

### Colors / theme

Theme tokens are in:

- `src/index.css`

Update these:

- `--good`, `--caution`, `--risk`
- `--bg`, `--card`, `--text`

### Add real weather API (optional next step)

Right now weather is simulated. To connect a real API (OpenWeather / WeatherAPI / IMD proxy):

- Replace `simulateWeatherNow()` and `simulateForecast()` in `src/lib/weatherSim.ts`
- Or create `src/lib/weatherApi.ts` and have `dashboardModel.ts` call it instead

## Notes

- **Diary data** is stored in the browser only (per location key).
- **GPS** depends on browser permission and may fail on insecure origins. Use localhost (secure context) for best results.

## License

MIT (you can change this as needed).
