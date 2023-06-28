import type { RouteObject } from "react-router-dom"

import AuthLayout from "./auth/_layout.tsx"
import { LoginCallback } from "./auth/callback.tsx"
import { Login } from "./auth/login.tsx"
import { PublicLayout } from "./public/_layout.tsx"
import { About } from "./public/about.tsx"
import { Home } from "./public/home.tsx"
import { UserLayout } from "./user/_layout.tsx"
import { UserDashboard } from "./user/dashboard.tsx"

export const routes: RouteObject[] = [
  // Public Routes
  {
    path: "/",
    element: <PublicLayout />,
    children: [
      { index: true, element: <Home /> },
      {
        path: "about",
        element: <About />,
      },
    ],
  },
  // Auth routes
  {
    path: "auth",
    element: <AuthLayout />,
    children: [
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "callback",
        element: <LoginCallback />,
      },
    ],
  },
  // User routes
  {
    path: "user",
    element: <UserLayout />,
    children: [
      {
        index: true,
        element: <UserDashboard />,
      },
    ],
  },
]
