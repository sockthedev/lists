import { Client } from "@pwa/functions/replicache/framework.ts"
import type { ServerType } from "@pwa/functions/replicache/server.ts"
import React from "react"
import { Replicache } from "replicache"

import { useAuth } from "./auth.tsx"
import { bus } from "./bus.tsx"

const mutators = new Client<ServerType>()
  // .mutation("connect", async (_tx, _input) => {})
  // .mutation("app_stage_sync", async (_tx, _input) => {})
  .build()

const ReplicacheContext = React.createContext<
  ReturnType<typeof createReplicache>
>(null as any)

function createReplicache(input: { workspaceId: string; token: string }) {
  const replicache = new Replicache({
    name: input.workspaceId,
    auth: `Bearer ${input.token}`,
    licenseKey: "l75bdf9ee8d1e453697e2948b3114d44c",
    pullURL: `${import.meta.env.VITE_API_URL}/replicache/pull`,
    pushURL: `${import.meta.env.VITE_API_URL}/replicache/push`,
    pullInterval: 65 * 1000,
    mutators,
  })

  // TODO: Don't think we need this? Looks like it is just debugging. Perhaps
  // we could wrap it with a DEVELOPMENT flag?
  replicache.subscribe(
    (tx) => {
      return tx.scan({ prefix: "" }).entries().toArray()
    },
    {
      onData: console.log,
    },
  )

  // Wrap the replicache push/pull methods to add the workspaceId header

  const oldPuller = replicache.puller
  replicache.puller = (opts) => {
    opts.headers.append("x-pwa-workspace", input.workspaceId)
    return oldPuller(opts)
  }

  const oldPusher = replicache.pusher
  replicache.pusher = (opts) => {
    opts.headers.append("x-pwa-workspace", input.workspaceId)
    return oldPusher(opts)
  }

  return replicache
}

export function ReplicacheProvider(props: {
  accountId: string
  workspaceId: string
  children: React.ReactNode
}) {
  const { account } = useAuth()
  const token = account?.token

  const rep = React.useMemo(() => {
    if (!token) return null
    return createReplicache({ workspaceId: props.workspaceId, token })
  }, [token, props.workspaceId])

  React.useEffect(() => {
    if (!rep) return

    const pokeHandler = (properties: { workspaceId: string }) => {
      if (properties.workspaceId !== props.workspaceId) return
      rep.pull()
    }

    bus.on("poke", pokeHandler)

    return () => {
      bus.off("poke", pokeHandler)
      rep.close()
    }
  }, [rep, props.workspaceId])

  if (!rep) {
    return null
  }

  return (
    <ReplicacheContext.Provider value={rep}>
      {props.children}
    </ReplicacheContext.Provider>
  )
}

export function useReplicache() {
  const result = React.useContext(ReplicacheContext)
  if (!result) {
    throw new Error("useReplicache must be used within a ReplicacheProvider")
  }
  return result
}
