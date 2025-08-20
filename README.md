# 🌤️ Weather 3D

Experience weather in a whole new dimension! A beautiful 3D weather application built with React Three Fiber that brings weather conditions to life through stunning 3D visualizations.

## ✨ Features

- **3D Weather Visualizations**: Dynamic 3D scenes that change based on current weather conditions
  - ☀️ Sunny: Animated sun with rotating rays
  - ☁️ Cloudy: Realistic 3D clouds using drei's Cloud component  
  - 🌧️ Rainy: Animated raindrops with storm clouds
  - ❄️ Snowy: Gentle snowfall with drifting particles
  - ⛈️ Stormy: Dark clouds with lightning effects
  - 🌫️ Foggy: Dense cloud coverage

- **Location Services**: 
  - Automatic location detection using browser geolocation
  - Manual location search by city name
  - Support for coordinates and city names

- **Beautiful UI**:
  - Soft, high-contrast gradient backgrounds
  - Glass-morphism design elements
  - Fully responsive for all devices
  - Smooth animations and transitions

- **Comprehensive Weather Data**:
  - Current temperature, conditions, and weather icon
  - "Feels like" temperature, humidity, wind speed, visibility
  - 3-day weather forecast with detailed information
  - Weather condition descriptions and icons

## 🚀 Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- A free API key from [WeatherAPI.com](https://www.weatherapi.com/)

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up your WeatherAPI key:
   ```bash
   # Copy the environment template
   cp .env.example .env
   
   # Edit .env and add your API key
   REACT_APP_WEATHER_API_KEY=your-actual-api-key-here
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory with:

```env
REACT_APP_WEATHER_API_KEY=your-weatherapi-key
```

### Getting a WeatherAPI Key

1. Visit [WeatherAPI.com](https://www.weatherapi.com/)
2. Sign up for a free account
3. Go to your dashboard and copy your API key
4. Add it to your `.env` file

## 🏗️ Built With

- **React** - Frontend framework
- **React Three Fiber** - React renderer for Three.js
- **@react-three/drei** - Useful helpers for React Three Fiber
- **Three.js** - 3D graphics library
- **Axios** - HTTP client for API requests
- **WeatherAPI.com** - Weather data provider

## 📱 Browser Support

The application works best on modern browsers that support:
- WebGL for 3D rendering
- Geolocation API for automatic location detection
- CSS backdrop-filter for glass-morphism effects

## 🎨 Design Features

- **Animated gradient background** that shifts colors over time
- **Glass-morphism UI elements** with backdrop blur effects
- **Responsive design** that adapts to all screen sizes
- **High contrast colors** for excellent readability
- **Smooth animations** and hover effects throughout

## 🔧 Available Scripts

- `npm start` - Runs the app in development mode
- `npm run build` - Builds the app for production
- `npm test` - Launches the test runner
- `npm run eject` - Ejects from Create React App (one-way operation)
