import React from 'react';

// Removed 2D weather icons - using 3D scene only

const CurrentWeather = ({ weatherData, isLoading }) => {
  if (isLoading) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center text-white">
        <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mb-4"></div>
        <p className="text-lg font-light">Loading weather data...</p>
      </div>
    );
  }

  if (!weatherData) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center text-white">
        <p className="text-xl font-light">Unable to load weather data</p>
      </div>
    );
  }

  const { current, location } = weatherData;
  
  return (
    <div className="fixed inset-0 text-white overflow-hidden">

      {/* Location Info */}
      <div className="absolute top-20 left-6 z-20">
        <div className="text-sm opacity-60">
          {location.name.toUpperCase()}
        </div>
        <div className="text-xs opacity-50 mt-1">
          {location.region}
        </div>
      </div>

      {/* Main 3D Weather Element - positioned in upper center */}
      <div className="absolute top-32 left-1/2 transform -translate-x-1/2 w-80 h-80 z-10">
        <div className="w-full h-full relative flex items-center justify-center">
          {/* Large 3D Sun representation */}
          <div className="w-64 h-64 rounded-full bg-gradient-radial from-yellow-200 via-yellow-400 to-orange-500 shadow-2xl relative overflow-hidden">
            {/* Sun surface texture */}
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-orange-300/30 to-red-400/20"></div>
            <div className="absolute inset-2 rounded-full border-2 border-orange-300/20"></div>
            <div className="absolute inset-4 rounded-full border border-yellow-200/30"></div>
            <div className="absolute inset-8 rounded-full border border-orange-200/20"></div>
            {/* Glow effect */}
            <div className="absolute -inset-4 rounded-full bg-orange-400/20 blur-xl animate-pulse"></div>
            <div className="absolute -inset-8 rounded-full bg-yellow-400/10 blur-2xl"></div>
          </div>
        </div>
      </div>

      {/* Temperature Display */}
      <div className="absolute bottom-80 left-6 z-20">
        <div className="flex items-baseline mb-2">
          <span className="text-8xl font-extralight leading-none tracking-tight">
            {Math.round(current.temp_f)}
          </span>
          <span className="text-3xl font-extralight ml-1 opacity-80">°</span>
        </div>
        <div className="text-lg font-light opacity-70 capitalize">
          {current.condition.text}
        </div>
      </div>

      {/* Additional Weather Details - Right side */}
      <div className="absolute bottom-80 right-6 text-right z-20">
        <div className="text-sm opacity-60 space-y-1">
          <div>H: {Math.round(current.temp_f + 5)}°</div>
          <div>L: {Math.round(current.temp_f - 10)}°</div>
        </div>
      </div>

      {/* Bottom Weather Stats */}
      <div className="absolute bottom-6 left-6 right-6 z-20">
        <div className="grid grid-cols-4 gap-4 text-center text-xs">
          <div>
            <div className="opacity-60 mb-1">HUMIDITY</div>
            <div className="text-white">{current.humidity}%</div>
          </div>
          <div>
            <div className="opacity-60 mb-1">WIND</div>
            <div className="text-white">{Math.round(current.wind_mph)} mph</div>
          </div>
          <div>
            <div className="opacity-60 mb-1">FEELS LIKE</div>
            <div className="text-white">{Math.round(current.feelslike_f)}°</div>
          </div>
          <div>
            <div className="opacity-60 mb-1">VISIBILITY</div>
            <div className="text-white">{Math.round(current.vis_miles)} mi</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrentWeather;