import { Outlet } from "react-router-dom"

import { RealtimeProvider } from "@/context/realtime"
import { ReplicacheProvider } from "@/context/replicache"

export function UserLayout() {
  return (
    <ReplicacheProvider>
      <RealtimeProvider>
        <Outlet />
      </RealtimeProvider>
    </ReplicacheProvider>
  )
}
