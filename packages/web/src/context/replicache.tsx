import type { List } from "@lists/core/list/index.ts"
import { Client } from "@lists/functions/replicache/framework.ts"
import type { ServerType } from "@lists/functions/replicache/server.ts"
import React from "react"
import { Replicache } from "replicache"
import invariant from "tiny-invariant"

import { ListStore } from "@/data/list.ts"

import { useAccount } from "./auth.tsx"
import { bus } from "./bus.tsx"

// TODO: Refactor the lists into it's own nested context

const mutators = new Client<ServerType>()
  .mutation("create_list", async (tx, input) => {
    console.log("mutation, create_list:", input.name)
    await tx.put(ListStore.key({ id: input.id }), {
      id: input.name,
      name: input.name,
    })
  })
  .build()

const ReplicacheContext = React.createContext<{
  lists: List.Type[]
  createList: (input: { name: string }) => void
}>(null as any)

export function ReplicacheProvider(props: { children: React.ReactNode }) {
  const account = useAccount()
  invariant(
    account,
    "ReplicacheProvider must be used inside an authorised session",
  )

  // TODO: Refactor this into an effect based initialiser
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
    const unsubscribe = replicache.subscribe(ListStore.all(), {
      onData(lists) {
        console.log("🤖 ReplicacheRootProvider: lists", lists)
        setLists(lists)
      },
    })
    return () => {
      unsubscribe()
    }
  }, [replicache])

  React.useEffect(() => {
    const pokeHandler = () => {
      replicache.pull()
    }

    bus.on("poke", pokeHandler)

    return () => {
      bus.off("poke", pokeHandler)
    }
  }, [replicache])

  React.useEffect(() => {
    if (!replicache) {
      return
    }
    return () => {
      replicache.close()
    }
  }, [replicache])

  return (
    <ReplicacheContext.Provider
      value={{
        lists,
        createList: (input: { name: string }) => {
          console.log("🤖 ReplicacheRootProvider: createList", input)
          replicache.mutate.create_list({ name: input.name })
          console.log("🤖 ReplicacheRootProvider: createList done")
        },
      }}
    >
      {props.children}
    </ReplicacheContext.Provider>
  )
}

export function useLists() {
  const { lists } = React.useContext(ReplicacheContext)
  return lists
}

export function useCreateList() {
  const { createList } = React.useContext(ReplicacheContext)
  return createList
}
