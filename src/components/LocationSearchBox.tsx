import { useEffect, useRef, useState, type ChangeEvent } from "react";
import type { City } from "../types";


type LocationSearchBoxProps = {
    setCurrentWeatherLocation: React.Dispatch<React.SetStateAction<City | undefined>>
    setWeatherLocations: React.Dispatch<React.SetStateAction<City[]>>
    setLocationSearchOpen: React.Dispatch<React.SetStateAction<boolean>>
    weatherLocations: City[];
}

const LocationSearchBox = ({ setCurrentWeatherLocation, setLocationSearchOpen, setWeatherLocations, weatherLocations }: LocationSearchBoxProps) => {
    const [searchSuggestions, setSearchSuggestions] = useState<City[]>([]);
    const wrapper = useRef<HTMLInputElement>(null);
    useEffect(() => {
        wrapper.current?.focus();
        if (wrapper.current) {
            wrapper.current.innerText = "";
        }

    }, [wrapper])
    
    const addWeatherLocation = (location: City) => {
        if (weatherLocations.findIndex(x => x.city === location.city) !== -1) {
            setCurrentWeatherLocation(location); 
            setLocationSearchOpen(false);
            return;
        }
         setCurrentWeatherLocation(location); 
         setWeatherLocations(xy => [...xy, location]); 
         setLocationSearchOpen(false);
    }
    
    const getSearchSuggestions = async (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.value.length < 2) {
            setSearchSuggestions([])
            return;
        }

        const firstTwo = e.target.value[0] + e.target.value[1];
        const citiesModule = await import(`../split_cities/${firstTwo.toLowerCase()}.json`);
        const cities: City[] = citiesModule.default;

        const filtered = cities.filter((entry: City) =>
            entry.city.toLowerCase().includes(e.target.value.toLowerCase())
        );

        setSearchSuggestions(filtered);
    }

    return <div className="searchWrapper"><input ref={wrapper} type="text" className="search" onChange={e => getSearchSuggestions(e)} onKeyDown={(e) => { if (e.key == "Escape") { setLocationSearchOpen(false) } }} />
        <div className="searchResults">
            {searchSuggestions.map(x => <div onClick={() => addWeatherLocation(x)}>{x.city}, {x.country}</div>).slice(0, 5)}
        </div>
        <p>Smaller cities/towns/villages may not pop up. Use the nearest location </p>
    </div>;
}



export default LocationSearchBox;