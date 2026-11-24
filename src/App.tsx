import { useEffect, useState } from 'react'
import { getWeather } from './getWeather';
import type { City, WeatherApiResponse } from './types';
import "./reset.css";
import "./index.css";
import LocationSearchBox from './components/LocationSearchBox';
import WeatherIcon from './WeatherIcon';
import LocationMenu from './components/LocationMenu';
import setCookie from './helpers/setCookie';
import getCookie from './helpers/getCookie';
import WindSVG from './assets/WindSVG';
import DayWeather from './components/DayWeather';
import Header from './components/Header';
function App() {
  const [weatherData, setWeatherdata] = useState<WeatherApiResponse>();
  const [dailyModalOpen, setDailyModalOpen] = useState(false);
  const [locationSearchOpen, setLocationSearchOpen] = useState(false);
  const [weatherLocations, setWeatherLocations] = useState<City[]>(getCookie("locations") || []);
  const [currentWeatherLocation, setCurrentWeatherLocation] = useState<City | undefined>();
  const [dayChosen, setDayChosen] = useState(new Date());
  useEffect(() => {
    if (weatherLocations.length) {
      setCurrentWeatherLocation(weatherLocations[0]);
    }
    const handleKeyPress = (e: KeyboardEvent) => {

      if (e.key == "/") {
        console.log("triggered")
        console.log(locationSearchOpen)
        setLocationSearchOpen(prev => !prev);

      }
    }
    window.addEventListener("keypress", handleKeyPress)
    return () => window.removeEventListener("keypress", handleKeyPress);
  }, [])

  useEffect(() => {

    currentWeatherLocation && getWeather(currentWeatherLocation?.lat.toString(), currentWeatherLocation?.lng.toString()).then(e => setWeatherdata(e))
  }, [currentWeatherLocation])

  useEffect(() => {
    setCookie("locations", JSON.stringify(weatherLocations), 2);
  }, [weatherLocations])


  return (
    <>
      <main className={weatherClassMap[weatherData?.current_weather.weathercode ?? 0]}>
        <Header />
        {dailyModalOpen && <DayWeather dayChosen={dayChosen} currentWeatherLocation={currentWeatherLocation} dailyModalOpen={dailyModalOpen} setDailyModalOpen={setDailyModalOpen} />}
        <h3 className='changeableLocation' onClick={() => setLocationSearchOpen(true)}>{currentWeatherLocation ? currentWeatherLocation.city : "Tap/click to set city"}  </h3>
        {currentWeatherLocation && <h4 className='changeableLocation' onClick={() => setLocationSearchOpen(true)}>Add city</h4>}
        <h1 className='bigText'>{weatherData?.current_weather.temperature}°C</h1>
        {locationSearchOpen == true && <LocationSearchBox weatherLocations={weatherLocations} setWeatherLocations={setWeatherLocations} setCurrentWeatherLocation={setCurrentWeatherLocation} setLocationSearchOpen={setLocationSearchOpen} />}
        <h3 className='weatherCondition'>{weatherDescriptionMap[weatherData?.current_weather.weathercode ?? 0]}</h3>
        <table>
          <thead>
            <tr>

              <th>
                Day
              </th>
              <th>
                Weather
              </th>
              <th>
                Min
              </th>
              <th>
                Max
              </th>
              <th>
                Wind
              </th>
              <th>
                Wind speed (km/h)
              </th>
            </tr>
          </thead>
          <tbody>
            {weatherData?.daily.time.map((x, i) => {

              if (i < 6) {
                return <tr onClick={() => { setDailyModalOpen(true); setDayChosen(new Date(weatherData.daily.time[i])) }}><td>{dayOfWeekMap[new Date(x.toString()).getDay()] + "\n" + x.split('-').slice(1).join('-')}</td><td><WeatherIcon weatherCode={weatherData?.daily.weather_code[i]} /> </td><td>{weatherData?.daily.temperature_2m_min[i]}</td><td>{weatherData?.daily.temperature_2m_max[i]}</td><td ><WindSVG
                  style={{
                    transform: `rotate(${(weatherData?.daily.wind_direction_10m_dominant[i] + 180) % 360}deg)`
                  }}
                /></td><td>{weatherData?.daily.wind_speed_10m_mean[i]}</td></tr>
              }
              return <tr onClick={() => setDailyModalOpen(true)}><td>{x.split('-').slice(1).join('-')}</td><td><WeatherIcon weatherCode={weatherData?.daily.weather_code[i]} /> </td><td>{weatherData?.daily.temperature_2m_min[i]}</td><td>{weatherData?.daily.temperature_2m_max[i]}</td><td><WindSVG
                style={{
                  transform: `rotate(${(weatherData?.daily.wind_direction_10m_dominant[i] + 180) % 360}deg)`
                }}
              /></td><td>{weatherData?.daily.wind_speed_10m_mean[i]}</td></tr>
            })}

          </tbody>

        </table>
      </main>
        <LocationMenu setWeatherData={setWeatherdata} currentWeatherLocation={currentWeatherLocation} weatherData={weatherData} locations={weatherLocations} setCurrentWeatherLocation={setCurrentWeatherLocation} setWeatherLocations={setWeatherLocations} />
    </>
  )
}

const dayOfWeekMap: Record<number, string> = {
  0: "Sunday",
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday"
}

const weatherDescriptionMap: Record<number, string> = {
  0: "Clear sky",

  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",

  45: "Fog",
  48: "Depositing rime fog",

  51: "Light drizzle",
  53: "Moderate drizzle",
  55: "Dense drizzle",

  56: "Light freezing drizzle",
  57: "Dense freezing drizzle",

  61: "Light rain",
  63: "Moderate rain",
  65: "Heavy rain",

  66: "Light freezing rain",
  67: "Heavy freezing rain",

  71: "Slight snowfall",
  73: "Moderate snowfall",
  75: "Heavy snowfall",

  77: "Snow grains",

  80: "Light rain showers",
  81: "Moderate rain showers",
  82: "Violent rain showers",

  85: "Slight snow showers",
  86: "Heavy snow showers",

  95: "Thunderstorm",
  96: "Thunderstorm with slight hail",
  99: "Thunderstorm with heavy hail"
};

export const weatherClassMap: Record<number, string> = {
  0: "clearSky",

  1: "mainlyClear",
  2: "partlyCloudy",
  3: "overcast",

  45: "fog",
  48: "depositingtimeFog",

  51: "drizzleLight",
  53: "drizzleModerate",
  55: "drizzleDense",

  56: "freezingDrizzleLight",
  57: "freezingDrizzleDense",

  61: "rainLight",
  63: "rainModerate",
  65: "rainHeavy",

  66: "freezingRainLight",
  67: "freezingRainHeavy",

  71: "snowFallSlight",
  73: "snowFallModerate",
  75: "snowFallHeavy",

  77: "snowGrains",

  80: "rainShowerLight",
  81: "rainModerate",      // closest visual match
  82: "rainHeavy",         // violent shower

  85: "snowFallSlight",
  86: "snowFallHeavy",

  95: "rainHeavy",         // thunderstorm visual fallback
  96: "rainHeavy",
  99: "rainHeavy"
};

export default App
