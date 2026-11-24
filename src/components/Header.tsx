import { Link } from 'react-router'

export default function Header() {
  return (
    <header>
        <h1>LucasWeather & Radar</h1>
        <ul>
            <li><Link to="/">Weather</Link></li>
            <li><Link to="/radar">🇳🇱 Shower radar (alpha)</Link></li>
        </ul>
    </header>
  )
}
