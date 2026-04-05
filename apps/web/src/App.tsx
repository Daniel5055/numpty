import "./App.css"
import { Link } from "react-router"

function App() {
  return (
    <div className="home-page">
      <div className="home-content">
        <div className="home-hero">
          <p>Durak with Whisson rules</p>
        </div>
        <div className="home-cta">
          <Link to="/singleplayer" className="cta-button primary">
            Play Now
          </Link>
          <Link to="/multiplayer" className="cta-button secondary">
            Multiplayer
          </Link>
        </div>
      </div>
    </div>
  )
}

export default App
