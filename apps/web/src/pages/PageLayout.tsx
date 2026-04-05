import "../styles/PageLayout.css"
import { NavLink, Outlet } from "react-router"

function PageLayout() {
  return (
    <>
      <nav>
        <div className="nav-side">
          <NavLink to="/singleplayer">Singleplayer</NavLink>
        </div>

        <h1>Numpty</h1>

        <div className="nav-side">
          <NavLink to="/multiplayer">Multiplayer</NavLink>
        </div>
      </nav>

      <Outlet />
    </>
  )
}

export default PageLayout
