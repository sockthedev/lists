import type { RouteObject } from "react-router-dom"

import AuthLayout from "./auth/_layout"
import { LoginCallback } from "./auth/callback"
import { Login } from "./auth/login"
import { PublicLayout } from "./public/_layout"
import { About } from "./public/about"
import { Home } from "./public/home"
import { UserLayout } from "./user/_layout"
import { UserDashboard } from "./user/dashboard"

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
