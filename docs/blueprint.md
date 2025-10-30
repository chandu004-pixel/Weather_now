# **App Name**: WeatherWise

## Core Features:

- City Search: Allow users to search for weather information by city name.
- Current Weather Display: Display current weather information for a city, including temperature, conditions, humidity, wind speed and pressure.
- 5-Day Forecast: Show a 5-day weather forecast, including daily high/low temperatures and weather icons.
- Themed Background: Change the background color of the card based on the current weather conditions using the weather[0].main value.
- Error Handling: Display user-friendly error messages for invalid city searches or API errors.
- Loading Indicator: Show a loading indicator while fetching weather data from the OpenWeatherMap API.

## Style Guidelines:

- Primary color: Dark teal (#008080) to give a clean and modern feel, reflective of weather conditions, yet distinct from default teal usage. Will contrast well with the light background.
- Background color: Very light gray-blue (#F0F8FF) to create a muted and calming atmosphere.
- Accent color: Warm yellow (#FFC107), 30 degrees 'left' of the primary, to highlight important information and calls to action.
- Body and headline font: 'Inter', a sans-serif font, will be used for both body and headline text for a modern, clean aesthetic.
- Use 'lucide-react' icons to visually represent weather conditions, providing a clear and consistent visual language.
- Use Tailwind CSS to create a responsive layout that adapts to different screen sizes, ensuring a seamless user experience on all devices. Centered content with rounded corners and subtle shadows to create a visually appealing container.
- Implement smooth transitions for state changes (e.g., loading, data fetching) to provide a polished and engaging user experience.