import { createBrowserRouter, RouterProvider } from "react-router-dom"

import { AuthProvider } from "./context/auth.tsx"
import { routes } from "./routes/index.tsx"

const router = createBrowserRouter(routes)

// TODO:
// - Integrate SwReloadPrompt
// - Integrate service worker automatic update (https://vite-pwa-org.netlify.app/frameworks/react.html#periodic-sw-updates)

export function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  )
}
