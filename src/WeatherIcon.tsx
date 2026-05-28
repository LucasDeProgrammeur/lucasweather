import DrizzleSVG from "./assets/DrizzleSVG";
import FogSVG from "./assets/FogSVG";
import LightSnowSVG from "./assets/LightSnowSVG";
import MainlyClearSVG from "./assets/MainlyClearSVG";
import ModerateRainSVG from "./assets/ModerateRainSVG";
import ModerateSnowSVG from "./assets/ModerateSnowSVG";
import SunSVG from "./assets/sunSVG";

type WeatherIconProps = {
    weatherCode: number;
}

const WeatherIcon = ({weatherCode}: WeatherIconProps) => {
    switch (weatherCode) {
        case 3:
        case 0:
            return <SunSVG />
        break;
        case 1:
        case 2:
            return <MainlyClearSVG />
            break;
        case 45:
            return <FogSVG />
            break;
        case 55:
        case 80:
        case 51:
        case 53:
        case 61:
            return <DrizzleSVG />
            break;
        case 63:
            return <ModerateRainSVG />
        case 71:
            return <LightSnowSVG />
        case 73:
            return <ModerateSnowSVG />
        default:
            return <p>{weatherCode}</p>
        break;
    }
    return <></>
}

export default WeatherIcon;