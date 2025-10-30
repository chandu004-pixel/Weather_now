"use client";

import { useState, useEffect, type FormEvent, type ReactElement } from "react";
import {
  Sun, Moon, CloudSun, CloudMoon, Cloud, CloudRain, CloudDrizzle,
  CloudLightning, Snowflake, Haze, Cloudy, Wind, Gauge, Droplets,
  Thermometer, Search, Loader2, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import type { WeatherData, ForecastData, ProcessedForecast } from "@/lib/types";
import { cn } from "@/lib/utils";

// --- API & UTILITY FUNCTIONS ---
const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
const API_BASE_URL = 'https://api.openweathermap.org/data/2.5';

const fetchWeather = async (city: string) => {
  if (!API_KEY) {
    throw new Error('OpenWeatherMap API key is missing. Please add it to your environment variables.');
  }
  const [currentWeatherResponse, forecastResponse] = await Promise.all([
    fetch(`${API_BASE_URL}/weather?q=${city}&units=metric&appid=${API_KEY}`),
    fetch(`${API_BASE_URL}/forecast?q=${city}&units=metric&appid=${API_KEY}`),
  ]);

  if (!currentWeatherResponse.ok || !forecastResponse.ok) {
    if (currentWeatherResponse.status === 401 || forecastResponse.status === 401) {
      throw new Error('Invalid API key. Please check your OpenWeatherMap API key.');
    }
    if (currentWeatherResponse.status === 404 || forecastResponse.status === 404) {
      throw new Error('City not found. Please try again.');
    }
    throw new Error('Failed to fetch weather data. Check your network connection.');
  }

  const currentWeatherData = await currentWeatherResponse.json();
  const forecastData = await forecastResponse.json();

  return {
    current: currentWeatherData,
    forecast: forecastData,
  };
};

const processForecastData = (forecastData: ForecastData): ProcessedForecast[] => {
    const dailyData: { [key: string]: { temps: number[], icons: string[] } } = {};
    const todayStr = new Date().toISOString().split('T')[0];

    for (const item of forecastData.list) {
        const day = item.dt_txt.split(' ')[0];

        if (day === todayStr) continue;

        if (!dailyData[day]) {
            dailyData[day] = { temps: [], icons: [] };
        }
        dailyData[day].temps.push(item.main.temp_max, item.main.temp_min);
        
        if (item.dt_txt.includes("12:00:00")) {
            dailyData[day].icons.unshift(item.weather[0].icon);
        } else {
            dailyData[day].icons.push(item.weather[0].icon);
        }
    }
    
    return Object.keys(dailyData).map(day => {
        const dayData = dailyData[day];
        return {
            day: new Date(day + 'T12:00:00Z').toLocaleDateString('en-US', { weekday: 'short' }),
            icon: dayData.icons[0] || '03d',
            temp_max: Math.round(Math.max(...dayData.temps)),
            temp_min: Math.round(Math.min(...dayData.temps)),
        };
    }).slice(0, 5);
};

const getWeatherIcon = (iconCode: string, className?: string): ReactElement => {
  const iconProps = { className: cn("w-full h-full", className) };
  const iconMap: { [key: string]: ReactElement } = {
    '01d': <Sun {...iconProps} />, '01n': <Moon {...iconProps} />,
    '02d': <CloudSun {...iconProps} />, '02n': <CloudMoon {...iconProps} />,
    '03d': <Cloud {...iconProps} />, '03n': <Cloud {...iconProps} />,
    '04d': <Cloudy {...iconProps} />, '04n': <Cloudy {...iconProps} />,
    '09d': <CloudRain {...iconProps} />, '09n': <CloudRain {...iconProps} />,
    '10d': <CloudDrizzle {...iconProps} />, '10n': <CloudDrizzle />,
    '11d': <CloudLightning {...iconProps} />, '11n': <CloudLightning />,
    '13d': <Snowflake {...iconProps} />, '13n': <Snowflake />,
    '50d': <Haze {...iconProps} />, '50n': <Haze />,
  };
  return iconMap[iconCode] || <Cloudy {...iconProps} />;
};


const getWeatherBgClass = (weatherMain: string | undefined): string => {
  if (!weatherMain) return 'from-gray-700 to-gray-800 text-white';

  switch (weatherMain) {
    case 'Clear': return 'from-sky-400 to-yellow-300 text-slate-800';
    case 'Clouds': return 'from-slate-400 to-gray-500 text-white';
    case 'Rain': return 'from-blue-700 to-gray-600 text-white';
    case 'Drizzle': return 'from-sky-600 to-gray-500 text-white';
    case 'Thunderstorm': return 'from-gray-800 to-purple-900 text-white';
    case 'Snow': return 'from-slate-300 to-cyan-200 text-slate-800';
    default: return 'from-gray-700 to-gray-800 text-white';
  }
};

// --- UI SUB-COMPONENTS ---
const CurrentWeatherDisplay = ({ data }: { data: WeatherData }) => (
  <div className="w-full md:w-1/2 p-4 flex flex-col items-center justify-center">
    <div className="text-center">
      <h2 className="text-4xl font-bold">{data.name}, {data.sys.country}</h2>
      <p className="text-2xl capitalize mt-2">{data.weather[0].description}</p>
    </div>
    <div className="flex items-center my-4">
      <div className="w-24 h-24">{getWeatherIcon(data.weather[0].icon)}</div>
      <div className="text-8xl font-bold ml-4">{Math.round(data.main.temp)}°C</div>
    </div>
    <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-lg">
      <div className="flex items-center gap-2"><Droplets /><span>{data.main.humidity}%</span></div>
      <div className="flex items-center gap-2"><Wind /><span>{data.wind.speed.toFixed(1)} m/s</span></div>
      <div className="flex items-center gap-2"><Gauge /><span>{data.main.pressure} hPa</span></div>
      <div className="flex items-center gap-2"><Thermometer /><span>{Math.round(data.main.feels_like)}°C</span></div>
    </div>
  </div>
);

const ForecastDisplay = ({ data }: { data: ProcessedForecast[] }) => (
  <div className="w-full md:w-1/2 p-4 md:border-l border-white/30">
    <h3 className="text-2xl font-bold mb-4 text-center md:text-left">5-Day Forecast</h3>
    <div className="flex flex-col gap-2">
      {data.map((day, index) => (
        <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-white/10">
          <span className="font-semibold w-12">{day.day}</span>
          <div className="w-8 h-8">{getWeatherIcon(day.icon)}</div>
          <div className="flex gap-2 w-20 justify-end">
            <span className="font-semibold">{day.temp_max}°</span>
            <span className="opacity-70">{day.temp_min}°</span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// --- MAIN COMPONENT ---
export default function WeatherWisePage() {
  const [city, setCity] = useState("London");
  const [searchTerm, setSearchTerm] = useState("London");
  const [weatherData, setWeatherData] = useState<{ current: WeatherData; forecast: ForecastData } | null>(null);
  const [processedForecast, setProcessedForecast] = useState<ProcessedForecast[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadWeather = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchWeather(city);
        setWeatherData(data);
        if (data.forecast) {
            setProcessedForecast(processForecastData(data.forecast));
        }
      } catch (err: any) {
        setError(err.message);
        setWeatherData(null);
        setProcessedForecast(null);
      } finally {
        setLoading(false);
      }
    };
    if (city) {
        loadWeather();
    }
  }, [city]);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setCity(searchTerm.trim());
    }
  };

  const bgClass = getWeatherBgClass(weatherData?.current.weather[0].main);

  return (
    <main className="flex min-h-screen w-full items-center justify-center p-4"  aria-label="WeatherWise application">
      <Card className={cn("w-full max-w-4xl shadow-2xl transition-all duration-500 bg-gradient-to-br", bgClass)}>
        <CardHeader>
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input 
              type="text" 
              placeholder="Search for a city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white/20 text-inherit placeholder:text-inherit/70 border-white/30 focus:bg-white/30 focus:ring-accent"
              aria-label="City search input"
            />
            <Button type="submit" variant="secondary" size="icon" disabled={loading} aria-label="Search city">
              {loading ? <Loader2 className="animate-spin" /> : <Search />}
            </Button>
          </form>
        </CardHeader>
        <CardContent className="p-2 md:p-6 min-h-[480px] flex items-center justify-center">
          {loading && (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-16 h-16 animate-spin"/>
            </div>
          )}
          {error && !loading && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {weatherData && processedForecast && !loading && (
            <div className="flex flex-col md:flex-row w-full">
              <CurrentWeatherDisplay data={weatherData.current} />
              <Separator orientation="vertical" className="hidden md:block mx-2 bg-white/30" />
              <ForecastDisplay data={processedForecast} />
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
