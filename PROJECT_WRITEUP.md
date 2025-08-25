# 3D Weather Visualization with Dynamic Sky System

*A real-time 3D weather visualization built with React Three Fiber*

## Overview

An immersive 3D weather visualization that renders real-time weather conditions in a dynamic 3D environment. The project combines weather API data with Three.js to create atmospheric scenes that change based on current weather conditions and time of day.

## Technology Stack

- **React Three Fiber** - React renderer for Three.js
- **Three.js** - 3D graphics library
- **@react-three/drei** - Useful helpers for R3F
- **Weather API** - Real-time weather data integration

## Key Features

### 🌅 Dynamic Time-of-Day System
The application features a sophisticated time-based lighting system with four distinct periods:

- **Dawn** (6-8 AM): Deep purple-blue atmosphere with low sun position
- **Day** (8 AM-5 PM): Bright, clear lighting with high sun position  
- **Dusk** (5-7 PM): Warm orange-brown atmosphere with setting sun
- **Night** (7 PM-6 AM): Dark blue environment with stars and moonlight

### ☁️ Weather-Responsive Environment
Visual elements dynamically adapt to current weather conditions:
- Storm conditions with dramatic lighting
- Rain effects with overcast skies
- Cloud formations based on weather data
- Atmospheric turbidity adjustments

### 🎮 Interactive 3D Controls
Constrained orbit controls provide intuitive scene navigation while maintaining optimal viewing angles.

## Technical Implementation

### Time-Based Sky System

The core innovation lies in the dynamic sky positioning system that creates realistic atmospheric transitions:

```javascript
const getTimeOfDay = () => {
  if (!weatherData?.location?.localtime) return 'day';
  const localTime = weatherData.location.localtime;
  const currentHour = new Date(localTime).getHours();
  
  if (currentHour >= 19 || currentHour <= 6) return 'night';
  if (currentHour >= 6 && currentHour < 8) return 'dawn';
  if (currentHour >= 17 && currentHour < 19) return 'dusk';
  return 'day';
};
```

### Atmospheric Sky Rendering

The Sky component uses calculated sun positions purely for atmospheric color generation, creating realistic sky gradients:

```javascript
<Sky
  sunPosition={(() => {
    switch(timeOfDay) {
      case 'dawn':
        return [100, -5, 100]; // Below horizon for purple dawn colors
      case 'dusk':
        return [-100, -5, 100]; // Below horizon for orange dusk colors
      case 'night':
        return [0, 0, 0]; // Hidden for dark night sky
      default: // day
        return [100, 20, 100]; // High position for bright blue sky
    }
  })()}
  turbidity={timeOfDay === 'dawn' || timeOfDay === 'dusk' ? 8 : (isNight ? 50 : 2)}
/>
```

The sun position here doesn't render a visible sun but controls the atmospheric scattering algorithms that generate realistic sky colors and gradients.

### Atmospheric Color Transitions

Background colors shift dramatically between time periods to enhance immersion:

```javascript
const getBackgroundColor = () => {
  if (isNight) return '#0A1428';
  
  // Dawn/dusk specific colors
  if (timeOfDay === 'dawn') return '#2D1B3D'; // Deep purple-blue for dawn
  if (timeOfDay === 'dusk') return '#3D2914'; // Deep orange-brown for dusk
  
  // Weather-based day colors
  if (condition.includes('storm')) return '#263238';
  if (condition.includes('rain')) return '#546E7A';
  return '#0D7FDB'; // Clear sky blue
};
```

### Weather Component Rendering

The visualization brings weather to life through specialized 3D components that intelligently parse weather API data to determine what elements to render:

#### Sun Component
Renders only when `weatherData.location.localtime` indicates daylight hours (6 AM - 7 PM):

```javascript
// Conditionally rendered based on API time data
const Sun = ({ weatherData }) => {
  const currentHour = new Date(weatherData.location.localtime).getHours();
  const isDaytime = currentHour >= 6 && currentHour < 19;
  
  if (!isDaytime) return null;
  
  return (
    <mesh position={calculateSunPosition(weatherData.location)}>
      <sphereGeometry args={[2, 32, 32]} />
      <meshBasicMaterial 
        color="#FDB813" 
        emissive="#FDB813" 
        emissiveIntensity={getDaylightIntensity(currentHour)} 
      />
    </mesh>
  );
};
```

#### Moon Component  
Appears during nighttime hours (7 PM - 6 AM) based on API timestamp data:

```javascript
// Moon visibility controlled by API time data
const Moon = ({ weatherData }) => {
  const currentHour = new Date(weatherData.location.localtime).getHours();
  const isNighttime = currentHour >= 19 || currentHour <= 6;
  
  if (!isNighttime) return null;
  
  return (
    <mesh position={calculateMoonPosition(weatherData.location)}>
      <sphereGeometry args={[1.5, 32, 32]} />
      <meshStandardMaterial 
        color="#E6E6FA"
        bumpMap={moonTexture}
        bumpScale={0.1}
      />
    </mesh>
  );
};
```

#### Cloud System
Reads `weatherData.current.condition.text` to determine cloud density and coverage:

```javascript
// Clouds rendered based on API weather condition strings
const Clouds = ({ weatherData }) => {
  const condition = weatherData.current.condition.text.toLowerCase();
  
  // Parse API condition text to determine cloud coverage
  const getCloudCoverage = () => {
    if (condition.includes('overcast')) return 0.9;
    if (condition.includes('cloudy')) return 0.6;
    if (condition.includes('partly cloudy')) return 0.3;
    return 0.1; // clear conditions
  };
  
  const coverage = getCloudCoverage();
  const cloudCount = Math.floor(coverage * 20);
  
  return (
    <instancedMesh args={[null, null, cloudCount]}>
      <boxGeometry args={[4, 2, 4]} />
      <meshLambertMaterial 
        color="#FFFFFF" 
        transparent 
        opacity={condition.includes('storm') ? 0.8 : 0.6}
      />
    </instancedMesh>
  );
};
```

#### Storm Effects
Triggered by specific condition keywords in `weatherData.current.condition.text`:

```javascript
// Rain/storm effects based on API condition parsing
const Storm = ({ weatherData }) => {
  const condition = weatherData.current.condition.text.toLowerCase();
  
  // Only render storm effects for specific weather conditions
  if (!condition.includes('rain') && !condition.includes('storm')) {
    return null;
  }
  
  // Intensity based on weather severity from API
  const getIntensity = () => {
    if (condition.includes('heavy rain') || condition.includes('storm')) return 1.0;
    if (condition.includes('moderate rain')) return 0.7;
    if (condition.includes('light rain')) return 0.4;
    return 0.2;
  };
  
  const intensity = getIntensity();
  const particleCount = intensity * 2000;
  
  return (
    <Points>
      <bufferGeometry>
        <bufferAttribute
          attachObject={['attributes', 'position']}
          count={particleCount}
          array={generateRainPositions(particleCount)}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial 
        color="#4A90E2" 
        size={0.1} 
        transparent 
        opacity={intensity * 0.8}
      />
    </Points>
  );
};
```


## Weather Integration

The system consumes real-time weather data and translates conditions into visual elements:

- **Temperature data** affects color temperature of lighting
- **Weather conditions** modify atmospheric effects and sky turbidity
- **Time zones** ensure accurate sun positioning based on location
- **Location data** influences sun trajectory calculations

## Performance Optimizations

- **useMemo** hooks prevent unnecessary recalculations of sun positions
- **Suspense boundaries** ensure smooth loading of 3D assets
- **Conditional rendering** of effects based on performance requirements
- **Optimized orbit controls** reduce computational overhead

## Visual Impact

The result is a living, breathing weather visualization that transforms throughout the day. Dawn brings mystical purple hues, day provides crystal clarity, dusk offers warm golden tones, and night creates a serene starlit atmosphere. Weather conditions layer additional complexity, making each viewing experience unique and contextually relevant.

This project demonstrates how modern web technologies can create compelling, data-driven 3D experiences that merge utility with artistic expression.

---

*Built with React Three Fiber • Three.js • Real-time Weather APIs*