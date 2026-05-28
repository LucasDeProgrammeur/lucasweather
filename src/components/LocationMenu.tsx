import React from 'react'
import type { City, WeatherApiResponse } from '../types'
import CloseSVG from '../assets/CloseSVG';
import { weatherClassMap } from '../App';

interface LocationMenuProps {
    currentWeatherLocation: City | undefined;
    locations: City[];
    setCurrentWeatherLocation: React.Dispatch<React.SetStateAction<City | undefined>>;
    setWeatherLocations: React.Dispatch<React.SetStateAction<City[]>>;
    weatherData: WeatherApiResponse | undefined;
    setWeatherData: React.Dispatch<React.SetStateAction<WeatherApiResponse | undefined>>
}

export default function LocationMenu({setWeatherData, currentWeatherLocation, locations, weatherData, setCurrentWeatherLocation, setWeatherLocations}: LocationMenuProps) {
  return (
    <>
    <div className={'locationMenu ' +  weatherClassMap[weatherData?.current_weather.weathercode ?? 0]}>
        {locations.map(x => <div className="location" onClick={() => setCurrentWeatherLocation(x)}><p>{x.city}</p> <CloseSVG clickAction={(ev: Event) => {
            ev.stopPropagation();
            ev.preventDefault();
            if (currentWeatherLocation?.city == x.city) {
              setCurrentWeatherLocation(undefined);
              setWeatherData(undefined);
            }
            setWeatherLocations(xy => xy.filter(xyz => xyz.city != x.city));
        }} /></div>)}
        
    </div>

    </>
  )
}
