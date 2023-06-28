import type { List } from "@lists/core/list/index.ts"
import React from "react"
import { Replicache } from "replicache"

import { ListStore } from "@/data/list.ts"

import { useAuth } from "./auth.tsx"

const ReplicacheRootContext = React.createContext<{
  lists: List.Type[]
}>(null as any)

export function ReplicacheRootProvider(props: { children: React.ReactNode }) {
  const { account } = useAuth()
  const [lists, setLists] = React.useState<List.Type[]>([])

  React.useEffect(() => {
    if (!account) {
      setLists([])
    }
  }, [account])

  React.useEffect(() => {
    if (!account) {
      return
    }

    const replicache = new Replicache({
      name: account.accountId,
      auth: `Bearer ${account.token}`,
      licenseKey: "l75bdf9ee8d1e453697e2948b3114d44c",
      pullURL: import.meta.env.VITE_API_URL + "/replicache/pull",
      pushURL: import.meta.env.VITE_API_URL + "/replicache/push",
    })

    replicache.subscribe(ListStore.all(), {
      onData(lists) {
        console.log("🤖 ReplicacheRootProvider: lists", lists)
        setLists(lists)
      },
    })

    return () => {
      replicache.close()
    }
  }, [account])

  return (
    <ReplicacheRootContext.Provider value={{ lists }}>
      {props.children}
    </ReplicacheRootContext.Provider>
  )
}

export function useLists() {
  const { lists } = React.useContext(ReplicacheRootContext)
  return lists
}
