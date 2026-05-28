import { formatDate } from "./getWeather";

export default async function GetDayWeather(lat: number | undefined, long: number | undefined, date: Date) {
    // const tomorrowDate = new Date(date);
    // tomorrowDate.setDate(date.getDate() + 1);

    let result = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${long}&daily=weather_code,wind_speed_10m_mean,temperature_2m_max,temperature_2m_min,sunrise,sunset,wind_direction_10m_dominant&hourly=temperature_2m,rain,showers&current_weather=true&start_date=${formatDate(date)}&end_date=${formatDate(date)}`).then(res => res.json()).then(data => {
        return data;
    })

    return result;
}
