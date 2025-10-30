"use client";

import { useState, useEffect, type FormEvent, type ReactElement } from "react";
import {
  Sun, Moon, CloudSun, CloudMoon, Cloud, CloudRain, CloudDrizzle,
  CloudLightning, Snowflake, Haze, Cloudy, Wind, Gauge, Droplets,
  Thermometer, Search, Loader2, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { WeatherData, ForecastData, ProcessedForecast } from "@/lib/types";
import { cn } from "@/lib/utils";

// --- MOCK DATA & UTILITY FUNCTIONS ---

const mockWeatherData: WeatherData = {
  coord: { lon: -0.1257, lat: 51.5085 },
  weather: [{ id: 801, main: "Clouds", description: "few clouds", icon: "02d" }],
  base: "stations",
  main: { temp: 18.5, feels_like: 18.2, temp_min: 16, temp_max: 21, pressure: 1012, humidity: 68 },
  visibility: 10000,
  wind: { speed: 4.63, deg: 240 },
  clouds: { all: 20 },
  dt: 1689786000,
  sys: { type: 2, id: 2075535, country: "GB", sunrise: 1689740033, sunset: 1689797893 },
  timezone: 3600,
  id: 2643743,
  name: "London",
  cod: 200,
};

const mockForecastData: ForecastData = {
    cod: "200",
    message: 0,
    cnt: 40,
    list: [
        // Today (will be skipped)
        { dt: 1689782400, main: { temp: 18, temp_min: 17, temp_max: 19, pressure: 1012, sea_level: 1012, grnd_level: 1011, humidity: 68, temp_kf: 0.27 }, weather: [{ id: 801, main: "Clouds", description: "few clouds", icon: "02d" }], clouds: { all: 20 }, wind: { speed: 4.0, deg: 240 }, visibility: 10000, pop: 0, sys: { pod: "d" }, dt_txt: new Date().toISOString().split('T')[0] + " 15:00:00" },
        // Tomorrow
        { dt: 1689868800, main: { temp: 20, temp_min: 15, temp_max: 22, pressure: 1015, sea_level: 1015, grnd_level: 1014, humidity: 60, temp_kf: -0.45 }, weather: [{ id: 800, main: "Clear", description: "clear sky", icon: "01d" }], clouds: { all: 0 }, wind: { speed: 3.0, deg: 210 }, visibility: 10000, pop: 0, sys: { pod: "d" }, dt_txt: new Date(Date.now() + 86400000).toISOString().split('T')[0] + " 12:00:00" },
        // Day after tomorrow
        { dt: 1689955200, main: { temp: 19, temp_min: 14, temp_max: 21, pressure: 1016, sea_level: 1016, grnd_level: 1015, humidity: 65, temp_kf: -0.32 }, weather: [{ id: 500, main: "Rain", description: "light rain", icon: "10d" }], clouds: { all: 75 }, wind: { speed: 5.0, deg: 190 }, visibility: 10000, pop: 0.4, sys: { pod: "d" }, dt_txt: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0] + " 12:00:00" },
        // 3 days from now
        { dt: 1690041600, main: { temp: 21, temp_min: 16, temp_max: 23, pressure: 1014, sea_level: 1014, grnd_level: 1013, humidity: 55, temp_kf: -0.21 }, weather: [{ id: 802, main: "Clouds", description: "scattered clouds", icon: "03d" }], clouds: { all: 40 }, wind: { speed: 3.5, deg: 220 }, visibility: 10000, pop: 0.1, sys: { pod: "d" }, dt_txt: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0] + " 12:00:00" },
        // 4 days from now
        { dt: 1690128000, main: { temp: 22, temp_min: 17, temp_max: 24, pressure: 1012, sea_level: 1012, grnd_level: 1011, humidity: 58, temp_kf: -0.15 }, weather: [{ id: 800, main: "Clear", description: "clear sky", icon: "01d" }], clouds: { all: 10 }, wind: { speed: 2.5, deg: 200 }, visibility: 10000, pop: 0, sys: { pod: "d" }, dt_txt: new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0] + " 12:00:00" },
        // 5 days from now
        { dt: 1690214400, main: { temp: 18, temp_min: 13, temp_max: 20, pressure: 1018, sea_level: 1018, grnd_level: 1017, humidity: 70, temp_kf: -0.38 }, weather: [{ id: 501, main: "Rain", description: "moderate rain", icon: "10d" }], clouds: { all: 90 }, wind: { speed: 6.0, deg: 180 }, visibility: 10000, pop: 0.7, sys: { pod: "d" }, dt_txt: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0] + " 12:00:00" },
    ],
    city: { id: 2643743, name: "London", coord: { lat: 51.5085, lon: -0.1257 }, country: "GB", population: 1000000, timezone: 3600, sunrise: 1689740033, sunset: 1689797893 },
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

const majorCities = ["London", "New York", "Tokyo", "Mumbai", "Delhi", "Bengaluru", "Paris", "Sydney"];

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
    const loadWeather = () => {
      if (!city) return;
      setLoading(true);
      setError(null);
      
      // Simulate an API call
      setTimeout(() => {
        if (city.toLowerCase() === 'error') {
           setError("This is a sample error message.");
           setWeatherData(null);
           setProcessedForecast(null);
        } else {
            const mockData = {
                current: { ...mockWeatherData, name: city },
                forecast: { ...mockForecastData, city: { ...mockForecastData.city, name: city } },
            }
            setWeatherData(mockData);
            setProcessedForecast(processForecastData(mockData.forecast));
        }
        setLoading(false);
      }, 1000);
    };
    
    loadWeather();
  }, [city]);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setCity(searchTerm.trim());
    }
  };

  const handleCitySelect = (selectedCity: string) => {
    setSearchTerm(selectedCity);
    setCity(selectedCity);
  }

  const bgClass = getWeatherBgClass(weatherData?.current.weather[0].main);

  return (
    <main className="flex min-h-screen w-full items-center justify-center p-4"  aria-label="WeatherWise application">
      <Card className={cn("w-full max-w-4xl shadow-2xl transition-all duration-500 bg-gradient-to-br", bgClass)}>
        <CardHeader>
          <CardTitle className="text-center text-3xl font-bold tracking-tight">WeatherNow</CardTitle>
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 mt-4">
            <div className="flex-grow flex gap-2">
              <Input 
                type="text" 
                placeholder="Search for a city... (try 'error')"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white/20 text-inherit placeholder:text-inherit/70 border-white/30 focus:bg-white/30 focus:ring-accent"
                aria-label="City search input"
              />
              <Select onValueChange={handleCitySelect} value={city}>
                <SelectTrigger className="w-[180px] bg-white/20 text-inherit border-white/30 focus:bg-white/30 focus:ring-accent" aria-label="Select a city">
                  <SelectValue placeholder="Or select a city" />
                </SelectTrigger>
                <SelectContent>
                  {majorCities.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" variant="secondary" size="icon" disabled={loading} aria-label="Search city" className="w-full sm:w-auto">
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
