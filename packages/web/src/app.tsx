import { createBrowserRouter, RouterProvider } from "react-router-dom"

import { AuthProvider } from "./context/auth.tsx"
import { routes } from "./routes/index.tsx"

const router = createBrowserRouter(routes)

export function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  )
}
