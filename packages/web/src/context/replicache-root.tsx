import type { List } from "@lists/core/list/index.ts"
import { Client } from "@lists/functions/replicache/framework.ts"
import type { ServerType } from "@lists/functions/replicache/server.ts"
import React from "react"
import { Replicache } from "replicache"
import invariant from "tiny-invariant"

import { ListStore } from "@/data/list.ts"

import { useAuth } from "./auth.tsx"

const mutators = new Client<ServerType>()
  .mutation("create_list", async (_tx, _input) => {})
  .build()

const ReplicacheRootContext = React.createContext<{
  lists: List.Type[]
  createList: (input: { name: string }) => Promise<void>
}>(null as any)

export function ReplicacheRootProvider(props: { children: React.ReactNode }) {
  const { account } = useAuth()
  invariant(
    account,
    "ReplicacheRootProvider must be used inside an AuthProvider",
  )

  const replicache = React.useMemo(() => {
    return new Replicache({
      name: account.accountId,
      auth: `Bearer ${account.token}`,
      licenseKey: "l75bdf9ee8d1e453697e2948b3114d44c",
      pullURL: import.meta.env.VITE_API_URL + "/replicache/pull",
      pushURL: import.meta.env.VITE_API_URL + "/replicache/push",
      pullInterval: 30 * 1000,
      mutators,
    })
  }, [account.token, account.accountId])

  const [lists, setLists] = React.useState<List.Type[]>([])

  React.useEffect(() => {
    if (!account) {
      setLists([])
    }
  }, [account])

  React.useEffect(() => {
    replicache.subscribe(ListStore.all(), {
      onData(lists) {
        console.log("🤖 ReplicacheRootProvider: lists", lists)
        setLists(lists)
      },
    })
    return () => {
      replicache.close()
    }
  }, [replicache])

  return (
    <ReplicacheRootContext.Provider
      value={{
        lists,
        createList: async (input: { name: string }) => {
          console.log("🤖 ReplicacheRootProvider: createList", input)
          await replicache.mutate.create_list({ name: input.name })
          console.log("🤖 ReplicacheRootProvider: createList done")
        },
      }}
    >
      {props.children}
    </ReplicacheRootContext.Provider>
  )
}

export function useLists() {
  const { lists } = React.useContext(ReplicacheRootContext)
  return lists
}

export function useCreateList() {
  const { createList } = React.useContext(ReplicacheRootContext)
  return createList
}
