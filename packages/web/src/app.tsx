import { createBrowserRouter, RouterProvider } from "react-router-dom"

import { AuthProvider } from "./context/auth"
import { routes } from "./routes"

const router = createBrowserRouter(routes)

export function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  )
}
