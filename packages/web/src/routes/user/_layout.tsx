import { Outlet } from "react-router-dom"

import { RealtimeProvider } from "@/context/realtime"
import { ReplicacheRootProvider } from "@/context/replicache-root"

export function UserLayout() {
  return (
    <ReplicacheRootProvider>
      <RealtimeProvider>
        <Outlet />
      </RealtimeProvider>
    </ReplicacheRootProvider>
  )
}
