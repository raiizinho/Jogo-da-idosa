import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Game from './components/Game.jsx'
import Login from './components/Login.jsx'
import Home from './components/Home.jsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

const router = createBrowserRouter([
  {path: "/", element: <Home />},
  {path: "/login", element: <Login />},
  {path: "/game", element: <Game />},
  {path: "*", element: <div>404 Not Found</div>}
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
