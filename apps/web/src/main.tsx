import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import { BrowserRouter, Route, Routes } from "react-router"
import App from "./App.tsx"
import PageLayout from "./pages/PageLayout.tsx"
import RemotePlayerPage from "./pages/RemotePlayerPage.tsx"
import ClientAIPage from "./pages/singleplayer/ClientAIPage.tsx"
import RemoteAIPage from "./pages/singleplayer/RemoteAIPage.tsx"
import SinglePlayerPage from "./pages/singleplayer/SingleplayerPage.tsx"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<PageLayout />}>
          <Route index element={<App />} />
          <Route path="singleplayer">
            <Route index element={<SinglePlayerPage />} />
            <Route path="local" element={<ClientAIPage />} />
            <Route path="remote" element={<RemoteAIPage />} />
          </Route>
          <Route path="multiplayer" element={<RemotePlayerPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
