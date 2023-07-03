import { Outlet } from "react-router-dom"

import { Header } from "@/components/header"
import { PageLayout } from "@/components/ui/page-layout"
import { RealtimeProvider } from "@/context/realtime"
import { ReplicacheProvider } from "@/context/replicache"

export function UserLayout() {
  return (
    <ReplicacheProvider>
      <RealtimeProvider>
        <PageLayout.StandardShell>
          <Header loggedIn />
          <PageLayout.Main>
            <Outlet />
          </PageLayout.Main>
        </PageLayout.StandardShell>
      </RealtimeProvider>
    </ReplicacheProvider>
  )
}
