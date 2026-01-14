
export enum WeatherType {
  CLEAR = 'CLEAR',
  SNOW = 'SNOW',
  RAIN = 'RAIN',
  STORM = 'STORM',
  WIND = 'WIND',
  CLOUDY = 'CLOUDY'
}

export interface WeatherConfig {
  label: string;
  icon: string;
  color: string;
  bgGradient: string;
}

export const WEATHER_CONFIGS: Record<WeatherType, WeatherConfig> = {
  [WeatherType.CLEAR]: {
    label: 'Sunny',
    icon: '☀️',
    color: 'text-yellow-400',
    bgGradient: 'from-blue-400 to-blue-600'
  },
  [WeatherType.SNOW]: {
    label: 'Snowing',
    icon: '❄️',
    color: 'text-blue-100',
    bgGradient: 'from-slate-800 to-slate-900'
  },
  [WeatherType.RAIN]: {
    label: 'Raining',
    icon: '🌧️',
    color: 'text-blue-400',
    bgGradient: 'from-slate-700 to-slate-800'
  },
  [WeatherType.STORM]: {
    label: 'Stormy',
    icon: '⚡',
    color: 'text-purple-400',
    bgGradient: 'from-gray-900 via-purple-900 to-black'
  },
  [WeatherType.WIND]: {
    label: 'Windy',
    icon: '🌬️',
    color: 'text-teal-400',
    bgGradient: 'from-teal-800 to-gray-900'
  },
  [WeatherType.CLOUDY]: {
    label: 'Cloudy',
    icon: '☁️',
    color: 'text-gray-300',
    bgGradient: 'from-gray-400 to-gray-600'
  }
};
