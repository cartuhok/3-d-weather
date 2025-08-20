import React from 'react';

const Forecast = ({ weatherData, isLoading, isNight }) => {
  if (isLoading || !weatherData?.forecast?.forecastday) {
    return null; // Hide forecast when loading to match the clean design
  }

  const forecastDays = weatherData.forecast.forecastday;

  const formatDay = (dateString, index) => {
    if (index === 0) return 'Today';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
  };

  const textColor = isNight ? 'text-white' : 'text-black';

  return (
    <div className="absolute bottom-32 left-6 right-6 z-20">
      <div className="flex justify-between items-center p-6">
        {forecastDays.slice(0, 3).map((day, index) => (
          <div key={day.date} className={`flex flex-col items-center space-y-3 ${textColor}`}>
            <div className="text-base opacity-60 font-light">
              {formatDay(day.date, index)}
            </div>
            <img 
              src={`https:${day.day.condition.icon}`} 
              alt={day.day.condition.text}
              className="w-10 h-10 filter brightness-125"
            />
            <div className="text-xl font-light">
              {Math.round(day.day.maxtemp_f)}°
            </div>
            <div className="text-base opacity-60">
              {Math.round(day.day.mintemp_f)}°
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Forecast;