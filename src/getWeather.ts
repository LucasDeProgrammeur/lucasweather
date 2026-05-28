const formatDate = (date: Date, addFourteen = false) => {
if (addFourteen) date.setDate(date.getDate() + 14); 
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // months are 0-indexed
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getWeather = async (lat: String, long: String) => {
    let result = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${long}&daily=weather_code,wind_speed_10m_mean,temperature_2m_max,temperature_2m_min,sunrise,sunset,wind_direction_10m_dominant&hourly=temperature_2m,rain,showers&current_weather=true&start_date=${formatDate(new Date)}&end_date=${formatDate(new Date, true)}`).then(res => res.json()).then(data => {
        return data;
    })

    return result;
}

export { getWeather, formatDate};