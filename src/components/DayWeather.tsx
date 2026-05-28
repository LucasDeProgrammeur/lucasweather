import React, { useEffect, useState } from 'react'
import type { WeatherApiResponse, City } from '../types';
import CloseSVG from '../assets/CloseSVG';
import GetDayWeather from '../getDayWeather';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
  BarElement,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import SunRiseSVG from '../assets/SunriseSVG';
import SunsetSVG from '../assets/SunsetSVG';
import { weatherClassMap } from '../App';

ChartJS.register(
  LineElement,
  BarElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend
);


type DayWeatherProps = {
  currentWeatherLocation: City | undefined;
  dailyModalOpen: boolean;
  setDailyModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  dayChosen: Date;
}



export default function DayWeather({ currentWeatherLocation, setDailyModalOpen, dayChosen }: DayWeatherProps) {
  const [dayData, setDayData] = useState<WeatherApiResponse | undefined>(undefined);

  useEffect(() => {
   GetDayWeather(currentWeatherLocation?.lat, currentWeatherLocation?.lng, dayChosen).then(data => { setDayData(data); })

  }, [])

  const getColor = () => {
    const weatherType = weatherClassMap[dayData?.current_weather.weathercode ?? 0]

    switch (weatherType) {
      case "overcast":
        return "#ffffff"
      default:
        return "#000000"
    }
  }
ChartJS.defaults.color = getColor()
  return (
    <div className='dayWeather'>
      <div className='modalTop'>
        <h2 style={{ flex: 1 }}>{dayChosen.toLocaleDateString()}</h2>
        <CloseSVG clickAction={() => { setDailyModalOpen(false) }} />
      </div>



      {dayData && <><Line
        options={{ color: getColor(), backgroundColor: getColor(), borderColor: getColor() }}
        data={{

          labels: dayData?.hourly.time.map(x => new Date(x).toLocaleTimeString("nl-NL", { hour: "numeric", minute: "numeric" })) || [],
          datasets: [
            {
              borderColor: getColor(),
              label: "Temperature",
              data: dayData?.hourly.temperature_2m || [],
            },
          ],
        }}
      />
        <Bar
          data={{
            labels: dayData?.hourly.time.map(x => new Date(x).toLocaleTimeString("nl-NL", { hour: "numeric", minute: "numeric" })) || [],
            datasets: [
              {
                label: "Rain (mm)",
                data: dayData?.hourly.rain || [],
                backgroundColor: getColor(),
                borderColor: getColor()
              },
            ],
          }} />
      </>}
      <section>
        <SunRiseSVG /> <p>{new Date(dayData?.daily.sunrise[0] || "").toLocaleTimeString("nl-NL", { hour: "numeric", minute: "numeric", timeZone: "+04:00" })}</p>
      </section>
      <section>
        <SunsetSVG /> <p>{new Date(dayData?.daily.sunset[0] || "").toLocaleTimeString("nl-NL", { hour: "numeric", minute: "numeric", timeZone: "+04:00" })}</p>
      </section>
      More daily weather information is coming soon
    </div>
  )
}
