import { Client } from "@lists/functions/replicache/framework.ts"
import type { ServerType } from "@lists/functions/replicache/server.ts"
import React from "react"
import { Replicache } from "replicache"
import invariant from "tiny-invariant"

import { useAuth } from "./auth.tsx"
import { bus } from "./bus.tsx"

const mutators = new Client<ServerType>().build()

type ReplicacheListInstance = ReturnType<typeof createReplicache>

const ReplicacheListContext = React.createContext<ReplicacheListInstance>(
  null as any,
)

function createReplicache(input: { listId: string; token: string }) {
  const replicache = new Replicache({
    name: input.listId,
    auth: `Bearer ${input.token}`,
    licenseKey: "l75bdf9ee8d1e453697e2948b3114d44c",
    pullURL: `${import.meta.env.VITE_API_URL}/replicache/pull`,
    pushURL: `${import.meta.env.VITE_API_URL}/replicache/push`,
    pullInterval: 30 * 1000,
    mutators,
  })

  if (import.meta.env.VITE_STAGE !== "production") {
    replicache.subscribe(
      (tx) => {
        return tx.scan({ prefix: "" }).entries().toArray()
      },
      {
        onData: console.log,
      },
    )
  }

  // Wrap the replicache push/pull methods to add the listId to headers

  const oldPuller = replicache.puller
  replicache.puller = (opts) => {
    opts.headers.append("x-list-id", input.listId)
    return oldPuller(opts)
  }

  const oldPusher = replicache.pusher
  replicache.pusher = (opts) => {
    opts.headers.append("x-list-id", input.listId)
    return oldPusher(opts)
  }

  return replicache
}

export function ReplicacheListProvider(props: {
  listId: string
  children: React.ReactNode
}) {
  const { account } = useAuth()
  invariant(
    account,
    "ReplicacheListProvider must be used within an active user session",
  )

  const [replicache, setReplicache] =
    React.useState<ReplicacheListInstance | null>(null)

  React.useEffect(() => {
    const _replicache = createReplicache({
      listId: props.listId,
      token: account.token,
    })

    setReplicache(_replicache)

    const pokeHandler = (properties: { listId: string }) => {
      if (properties.listId !== props.listId) return
      _replicache.pull()
    }

    bus.on("poke", pokeHandler)

    return () => {
      bus.off("poke", pokeHandler)
      _replicache.close()
    }
  }, [props.listId, account.token])

  if (!replicache) {
    return null
  }

  return (
    <ReplicacheListContext.Provider value={replicache}>
      {props.children}
    </ReplicacheListContext.Provider>
  )
}

// export function useReplicache() {
//   const result = React.useContext(ReplicacheListContext)
//   if (!result) {
//     throw new Error("useReplicache must be used within a ReplicacheProvider")
//   }
//   return result
// }
