import L from 'leaflet';
import { useEffect, useMemo, useRef, useState } from 'react'
import { MapContainer, TileLayer, WMSTileLayer } from 'react-leaflet'
import Header from './components/Header';

export default function Radar() {



    const [timeSteps, setTimeSteps] = useState<Array<string>>([]);
    const [currentTimeStep, setCurrentTimeStep] = useState<String>("");
    const [index, setIndex] = useState<number | null>(null);
    const [displayIndex, setDisplayIndex] = useState(0)
    const [cachedIndices, setCachedIndices] = useState<Set<number>>(new Set([0]))
    const layerRef = useRef<any>(null);
    const WINDOW = 1;
    useEffect(() => {
        if (layerRef.current) {
            layerRef.current.setParams({
                TIME: currentTimeStep,
            });
        }
    }, [currentTimeStep]);


    useEffect(() => {
        GetCapabilities();
        //   const now = new Date()

        //     const closestTime = times.reduce((prev, curr) => {
        //         return Math.abs(new Date(curr) - now) < Math.abs(new Date(prev) - now)
        //             ? curr
        //             : prev
        //     })

    }, []);

    useEffect(() => {
        console.log(currentTimeStep)
    }, [currentTimeStep])

    useEffect(() => {
    const t = setTimeout(() => {
        setDisplayIndex(Number(index))
    }, 1000)

    return () => clearTimeout(t)
}, [index])

    useEffect(() => {
        const newCache = new Set(cachedIndices)

        for (
            let i = Math.max(0, (index ?? 0) - WINDOW);
            i <= Math.min(timeSteps.length - 1, (index ?? 0) + WINDOW);
            i++
        ) {
            newCache.add(i)
        }

        setCachedIndices(newCache)
    }, [index, timeSteps])

    async function GetCapabilities() {
        const res = await fetch(
            "https://anonymous.api.dataplatform.knmi.nl/wms/adaguc-server?DATASET=radar_forecast_2.0&SERVICE=WMS&REQUEST=GetCapabilities"
        )

        const text = await res.text()

        // Parse XML
        const parser = new DOMParser()
        const xml = parser.parseFromString(text, "text/xml")

        // Find <Dimension name="time">
        const timeNode = xml.querySelector('Dimension[name="time"]')

        if (!timeNode) {
            console.error("No time dimension found")
            return []
        }

        const value = timeNode.textContent.trim()

        // Example format:
        // 2026-05-21T08:35:00Z/2026-05-28T10:30:00Z/PT5M
        const [start, end, step] = value.split("/")

        const startDate = new Date(start)
        const endDate = new Date(end)

        // parse PT5M → 5 minutes
        const match = step.match(/PT(\d+)M/)
        const stepMinutes = match ? parseInt(match[1]) : 5

        let times = []

        let current = new Date(startDate)

        while (current <= endDate) {
            times.push(current.toISOString())
            current.setMinutes(current.getMinutes() + stepMinutes)
        }
        times = times.slice(times.length - 25, times.length);

        console.log("Radar times:", times)
        setTimeSteps(times);
        setCurrentTimeStep(times[0]);
        return times
    }


const radarLayers = useMemo(() => {
    return timeSteps.map((time, i) => {
        if (!cachedIndices.has(i)) return null

        return (
            <WMSTileLayer
                            key={time}
                            url="https://anonymous.api.dataplatform.knmi.nl/wms/adaguc-server"
                            layers="precipitation_nowcast"
                            format="image/png"
                            transparent
                            version="1.3.0"
                            styles="rainrate-blue-to-purple/shaded"
                            attribution="KNMI"
                            opacity={i === displayIndex ? 1 : 0.01}
                            zIndex={i === displayIndex ? 100 : 1}
                            updateWhenIdle={true}
                            keepBuffer={2}
                            params={{
                                DATASET: "radar_forecast_2.0",
                                TIME: time,
                            }}
                        />
        )
    })
}, [cachedIndices, timeSteps, displayIndex])

    return (
        <main>
            <Header />
            {!timeSteps.length && <h3>Fetching possible timeframe, loading...</h3>}
            <MapContainer crs={L.CRS.EPSG3857} center={[52.1326, 5.2913]} zoom={7} zoomControl={false} maxZoom={7} minZoom={7} scrollWheelZoom={false} doubleClickZoom={false}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {radarLayers}

            </MapContainer>
            {!isNaN(Number(index)) && timeSteps && <h3>Time ({new Date(timeSteps[Number(index)]).toLocaleTimeString()})</h3>}
            {timeSteps.length && <input type="range" step={0} min={0} max={24} value={index || 0} onChange={e => setIndex(Number(e.target.value))} onPointerUp={_ => setCurrentTimeStep(timeSteps[Number(index)])} />}

            <p>Loading in the tiles from KNMI is slow at this moment. A fix is being worked on.</p>
        </main>
    )
}
