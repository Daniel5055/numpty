import { Link } from "react-router"
import "../../styles/SingleplayerPage.css"

function SinglePlayerPage() {
  return (
    <div className="singleplayer-page">
      <h2>Choose opponent</h2>
      <div className="opponent-options">
        <div className="opponent-card">
          <h3>Local AI</h3>
          <Link to="local" className="opponent-link">
            Play
          </Link>
        </div>
        <div className="opponent-card">
          <h3>Remote AI</h3>
          <div className="opponent-input-group">
            <input defaultValue={"http://localhost:3000"} />
            <Link to="remote" className="opponent-link">
              Play
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SinglePlayerPage
