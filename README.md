# Habit Tracker

A beautiful, responsive habit tracking application with analytics and achievement system. Built with React, TypeScript, Tailwind CSS, and Vite.

## Features

- **Today's Tracking**: Daily habit check-in with progress visualization
- **Analytics Dashboard**: Detailed statistics including:
  - Longest streak tracking
  - Average completion rate
  - Active habits count
  - Habit completion rankings
  - Heatmap of check-ins (last 90 days)
  - Completion trends chart
- **Achievement System**: Unlock achievements as you build consistency
- **Responsive Design**: Works seamlessly on mobile and desktop
- **Real-time Updates**: Instant feedback on habit completion

## Project Structure

```
habit-tracker/
├── src/
│   ├── main.tsx              # React entry point
│   ├── App.tsx               # Main application component
│   └── index.css             # Global styles with Tailwind
├── index.html                # HTML template
├── package.json              # Dependencies and scripts
├── vite.config.ts            # Vite configuration
├── tsconfig.json             # TypeScript configuration
├── tailwind.config.js        # Tailwind CSS configuration
├── postcss.config.js         # PostCSS configuration
└── standalone.html           # Single-file version for quick demos
```

## Installation

1. Clone or download the project
2. Install dependencies:
   ```bash
   npm install
   ```

## Development

Start the development server with hot reload:

```bash
npm run dev
```

The app will open automatically at `http://localhost:5173`

## Build

Create a production-optimized build:

```bash
npm run build
```

The optimized files will be in the `dist/` directory.

## Preview Build

Preview the production build locally:

```bash
npm run preview
```

## Standalone Version

For quick demos or sharing without Node.js:

1. Open `standalone.html` directly in your browser
2. No build step or installation required
3. All functionality works identically to the React version

## Technologies Used

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Icon library
- **Vite** - Build tool with hot reload
- **PostCSS** - CSS processing

## Mock Data

The application includes pre-configured mock data:

- 4 sample habits (Morning Run, Meditation, Reading, Fitness)
- 6 achievements with unlock progress
- 90 days of history for analytics

Future versions will connect to a backend API for data persistence.

## Browser Support

- Chrome/Chromium 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

Open source - free to use and modify.
