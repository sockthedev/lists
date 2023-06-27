import { Link, Outlet, ScrollRestoration } from "react-router-dom"

import { RealtimeProvider } from "@/context/realtime"

export function PublicLayout() {
  return (
    <>
      <h1>PWA</h1>
      <ul>
        <li>
          <Link to="/about">About</Link>
        </li>
        <li>
          <Link to="/auth/login">Sign In</Link>
        </li>
      </ul>
      <Outlet />
      <ScrollRestoration />
      <RealtimeProvider />
    </>
  )
}
