
import React, { useState, useRef, useEffect } from 'react';
import { WeatherType, WEATHER_CONFIGS } from './types';
import WeatherOverlay from './components/WeatherOverlay';
import WhatsAppTools from './components/WhatsAppTools';
import { CloudLightning, Sun, CloudRain, Snowflake, Wind, Cloud, MapPin } from 'lucide-react';
import { getWeatherFromLocation } from './services/geminiService';

const App: React.FC = () => {
  const [weather, setWeather] = useState<WeatherType>(WeatherType.CLEAR);
  const [isDetecting, setIsDetecting] = useState(true);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const autoDetectWeather = async () => {
      setIsDetecting(true);
      
      // Try Browser Geolocation first
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const detectedWeather = await getWeatherFromLocation(
              position.coords.latitude, 
              position.coords.longitude
            );
            setWeather(detectedWeather);
            setIsDetecting(false);
          },
          async () => {
            // Fallback to IP-based detection via Gemini if geo fails
            const detectedWeather = await getWeatherFromLocation();
            setWeather(detectedWeather);
            setIsDetecting(false);
          },
          { timeout: 10000 }
        );
      } else {
        // Fallback for browsers without geolocation
        const detectedWeather = await getWeatherFromLocation();
        setWeather(detectedWeather);
        setIsDetecting(false);
      }
    };

    autoDetectWeather();
  }, []);

  const getThemeColor = () => WEATHER_CONFIGS[weather].bgGradient;

  return (
    <div className={`min-h-screen w-full transition-all duration-1000 bg-gradient-to-br ${getThemeColor()} flex flex-col items-center pt-8 md:pt-12 p-4 relative overflow-hidden`}>
      {/* Background Weather Effects */}
      <WeatherOverlay type={weather} cardRef={cardRef} />

      {/* Minimal Top Weather Controls */}
      <nav className="z-50 mb-12 flex items-center gap-1 bg-black/30 backdrop-blur-3xl p-1.5 rounded-full border border-white/5 shadow-2xl relative">
        {isDetecting && (
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
            <span className="flex items-center gap-1 text-[8px] text-white/40 uppercase tracking-widest font-bold animate-pulse">
              <MapPin className="w-2 h-2" /> Syncing Local Atmosphere...
            </span>
          </div>
        )}
        <button 
          onClick={() => setWeather(WeatherType.CLEAR)}
          className={`p-3 rounded-full transition-all duration-300 ${weather === WeatherType.CLEAR ? 'bg-white text-blue-600 scale-110 shadow-lg' : 'text-white/30 hover:text-white hover:bg-white/5'}`}
          aria-label="Clear"
        >
          <Sun className="w-5 h-5" />
        </button>
        <button 
          onClick={() => setWeather(WeatherType.SNOW)}
          className={`p-3 rounded-full transition-all duration-300 ${weather === WeatherType.SNOW ? 'bg-white text-blue-400 scale-110 shadow-lg' : 'text-white/30 hover:text-white hover:bg-white/5'}`}
          aria-label="Snow"
        >
          <Snowflake className="w-5 h-5" />
        </button>
        <button 
          onClick={() => setWeather(WeatherType.RAIN)}
          className={`p-3 rounded-full transition-all duration-300 ${weather === WeatherType.RAIN ? 'bg-white text-blue-500 scale-110 shadow-lg' : 'text-white/30 hover:text-white hover:bg-white/5'}`}
          aria-label="Rain"
        >
          <CloudRain className="w-5 h-5" />
        </button>
        <button 
          onClick={() => setWeather(WeatherType.STORM)}
          className={`p-3 rounded-full transition-all duration-300 ${weather === WeatherType.STORM ? 'bg-white text-purple-600 scale-110 shadow-lg' : 'text-white/30 hover:text-white hover:bg-white/5'}`}
          aria-label="Storm"
        >
          <CloudLightning className="w-5 h-5" />
        </button>
        <button 
          onClick={() => setWeather(WeatherType.WIND)}
          className={`p-3 rounded-full transition-all duration-300 ${weather === WeatherType.WIND ? 'bg-white text-teal-600 scale-110 shadow-lg' : 'text-white/30 hover:text-white hover:bg-white/5'}`}
          aria-label="Wind"
        >
          <Wind className="w-5 h-5" />
        </button>
        <button 
          onClick={() => setWeather(WeatherType.CLOUDY)}
          className={`p-3 rounded-full transition-all duration-300 ${weather === WeatherType.CLOUDY ? 'bg-white text-gray-600 scale-110 shadow-lg' : 'text-white/30 hover:text-white hover:bg-white/5'}`}
          aria-label="Cloudy"
        >
          <Cloud className="w-5 h-5" />
        </button>
      </nav>

      {/* Main Content Container */}
      <div className="w-full flex flex-col items-center flex-1 justify-center relative">
        <main className="w-full max-w-4xl z-20">
          <WhatsAppTools ref={cardRef} currentWeather={weather} />
        </main>
      </div>

      {/* Footer */}
      <footer className="w-full mt-auto pb-6 text-white/10 text-[9px] uppercase tracking-[0.3em] font-bold text-center z-20 pointer-events-none">
        Secure & Private WhatsApp Utility
      </footer>

      {/* Decorative Blur Spheres */}
      <div className="absolute top-0 left-0 w-[60%] h-[60%] bg-white/5 rounded-full blur-[160px] pointer-events-none opacity-50"></div>
      <div className="absolute bottom-0 right-0 w-[60%] h-[60%] bg-black/10 rounded-full blur-[200px] pointer-events-none opacity-50"></div>
    </div>
  );
};

export default App;
