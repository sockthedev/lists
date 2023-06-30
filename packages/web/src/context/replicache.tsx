import { Client } from "@lists/functions/replicache/framework.ts"
import type { ServerType } from "@lists/functions/replicache/server.ts"
import { createId } from "@paralleldrive/cuid2"
import React from "react"
import { Replicache } from "replicache"
import { useSubscribe } from "replicache-react"
import invariant from "tiny-invariant"

import { ListStore } from "@/data/list.ts"

import { useAccount } from "./auth.tsx"
import { bus } from "./bus.tsx"

function createReplicache(input: { token: string; accountId: string }) {
  console.log("🌍 createReplicache", input.accountId)
  return new Replicache({
    // logLevel: "debug",
    name: input.accountId,
    auth: `Bearer ${input.token}`,
    licenseKey: "l75bdf9ee8d1e453697e2948b3114d44c",
    pullURL: import.meta.env.VITE_API_URL + "/replicache/pull",
    pushURL: import.meta.env.VITE_API_URL + "/replicache/push",
    pullInterval: 30 * 1000,
    pushDelay: 1000,
    mutators,
  })
}

const mutators = new Client<ServerType>()
  .mutation("create_list", async (tx, input) => {
    console.log("🌍 replicache.mutation: create_list", input.name)
    await ListStore.create(tx, input)
  })
  .build()

const ReplicacheContext = React.createContext<
  ReturnType<typeof createReplicache>
>(null as any)

export function ReplicacheProvider(props: { children: React.ReactNode }) {
  const account = useAccount()
  invariant(
    account,
    "ReplicacheProvider must be used inside an authorised session",
  )

  const [replicache, setReplicache] = React.useState<ReturnType<
    typeof createReplicache
  > | null>(null)

  React.useEffect(() => {
    if (!account.token || !account.accountId) {
      return
    }

    console.log("🌍 createReplicache", account.accountId, account.token)
    const _replicache = createReplicache({
      token: account.token,
      accountId: account.accountId,
    })
    setReplicache(_replicache)

    return () => {
      _replicache.close()
    }
  }, [account.token, account.accountId])

  React.useEffect(() => {
    if (!replicache) {
      return
    }

    const pokeHandler = () => {
      replicache.pull()
    }

    bus.on("poke", pokeHandler)

    return () => {
      bus.off("poke", pokeHandler)
    }
  }, [replicache])

  return (
    <ReplicacheContext.Provider value={replicache!}>
      {replicache && props.children}
    </ReplicacheContext.Provider>
  )
}

export function useSubscribeLists() {
  const replicache = React.useContext(ReplicacheContext)
  return useSubscribe(replicache, ListStore.all(), [], [replicache])
}

export function useCreateList() {
  const replicache = React.useContext(ReplicacheContext)
  const createList = React.useCallback(
    (input: { name: string }) => {
      replicache.mutate.create_list({ id: createId(), name: input.name })
    },
    [replicache],
  )
  return createList
}
