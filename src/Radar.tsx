import L from 'leaflet';
import { useEffect, useState } from 'react'
import { ImageOverlay, MapContainer, TileLayer } from 'react-leaflet'
import Header from './components/Header';

const WMS_URL = "https://anonymous.api.dataplatform.knmi.nl/wms/adaguc-server"
const DATASET = "radar_forecast_2.0"
const FRAME_COUNT = 25
const ZOOM = 7

// Area covered by each radar image. Larger than what is visible at zoom 7,
// so dragging the map doesn't reveal the image edge.
const BOUNDS = L.latLngBounds([49.5, 0], [55, 10.5])

// Request the image in the map's own projection (Web Mercator, EPSG:3857).
// ImageOverlay stretches the image linearly between its corners, which only
// lines up if the image itself is in the same projection as the map.
const sw = L.CRS.EPSG3857.project(BOUNDS.getSouthWest())
const ne = L.CRS.EPSG3857.project(BOUNDS.getNorthEast())
const BBOX = [sw.x, sw.y, ne.x, ne.y].join(",")

// Request the image at the map's native resolution for this zoom level,
// so it is as sharp as the old tiles without downloading extra pixels.
const size = L.CRS.EPSG3857.latLngToPoint(BOUNDS.getSouthEast(), ZOOM)
    .subtract(L.CRS.EPSG3857.latLngToPoint(BOUNDS.getNorthWest(), ZOOM))

function frameUrl(time: string) {
    const params = new URLSearchParams({
        DATASET,
        SERVICE: "WMS",
        REQUEST: "GetMap",
        VERSION: "1.3.0",
        LAYERS: "precipitation_nowcast",
        STYLES: "rainrate-blue-to-purple/shaded",
        FORMAT: "image/png",
        TRANSPARENT: "true",
        CRS: "EPSG:3857",
        BBOX,
        WIDTH: String(Math.round(size.x)),
        HEIGHT: String(Math.round(size.y)),
        TIME: time,
    })
    return `${WMS_URL}?${params}`
}

// Reads the available time range from GetCapabilities and returns the last
// FRAME_COUNT time steps, oldest first.
async function fetchTimeSteps(signal: AbortSignal): Promise<string[]> {
    const res = await fetch(`${WMS_URL}?DATASET=${DATASET}&SERVICE=WMS&REQUEST=GetCapabilities`, { signal })
    const xml = new DOMParser().parseFromString(await res.text(), "text/xml")

    // Example: "2026-05-21T08:35:00Z/2026-05-28T10:30:00Z/PT5M" (start/end/step)
    const value = xml.querySelector('Dimension[name="time"]')?.textContent?.trim()
    if (!value) throw new Error("No time dimension found")

    const [, end, step] = value.split("/")
    const stepMs = Number(step?.match(/PT(\d+)M/)?.[1] ?? 5) * 60_000
    const endMs = new Date(end).getTime()

    return Array.from({ length: FRAME_COUNT }, (_, i) =>
        new Date(endMs - (FRAME_COUNT - 1 - i) * stepMs).toISOString()
    )
}

export default function Radar() {
    const [timeSteps, setTimeSteps] = useState<string[]>([])
    // time step → local object URL of the downloaded radar image
    const [frames, setFrames] = useState<Record<string, string>>({})
    const [index, setIndex] = useState(0)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const controller = new AbortController()
        const objectUrls: string[] = []

        async function loadFrame(time: string) {
            try {
                const res = await fetch(frameUrl(time), { signal: controller.signal })
                if (!res.ok) throw new Error(`HTTP ${res.status}`)
                const blob = await res.blob()
                if (controller.signal.aborted) return
                const url = URL.createObjectURL(blob)
                objectUrls.push(url)
                setFrames(prev => ({ ...prev, [time]: url }))
            } catch (e) {
                if (!controller.signal.aborted) console.error(`Radar frame ${time} failed:`, e)
            }
        }

        fetchTimeSteps(controller.signal)
            .then(times => {
                setTimeSteps(times)
                // Download every frame up front, in parallel. Each is one small
                // PNG (~10-15 KB), so all 25 arrive within a few seconds.
                times.forEach(loadFrame)
            })
            .catch(e => {
                if (!controller.signal.aborted) setError(String(e))
            })

        return () => {
            controller.abort()
            objectUrls.forEach(url => URL.revokeObjectURL(url))
        }
    }, [])

    const time = timeSteps[index]
    const frame = time ? frames[time] : undefined
    const loadedCount = Object.keys(frames).length

    return (
        <main>
            <Header />
            {error && <h3>Could not load radar data: {error}</h3>}
            {!error && !timeSteps.length && <h3>Fetching possible timeframe, loading...</h3>}
            <MapContainer crs={L.CRS.EPSG3857} center={[52.1326, 5.2913]} zoom={ZOOM} zoomControl={false} maxZoom={ZOOM} minZoom={ZOOM} scrollWheelZoom={false} doubleClickZoom={false}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {frame && <ImageOverlay url={frame} bounds={BOUNDS} attribution="KNMI" />}
            </MapContainer>
            {time && <h3>Time ({new Date(time).toLocaleTimeString()})</h3>}
            {timeSteps.length > 0 && (
                <input
                    type="range"
                    min={0}
                    max={timeSteps.length - 1}
                    step={1}
                    value={index}
                    onChange={e => setIndex(Number(e.target.value))}
                />
            )}
            {timeSteps.length > 0 && loadedCount < timeSteps.length && (
                <p>Loading radar frames... {loadedCount}/{timeSteps.length}</p>
            )}
        </main>
    )
}
