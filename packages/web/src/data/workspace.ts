import type { Workspace } from "@pwa/core/workspace/index.ts"
import type { ReadTransaction } from "replicache"

export * as WorkspaceStore from "./workspace.ts"

export function list() {
  return async (tx: ReadTransaction) => {
    const result = await tx.scan({ prefix: `/workspace/` }).toArray()
    return (result || []) as unknown as Workspace.Type[]
  }
}

export function fromSlug(slug: string) {
  return async (tx: ReadTransaction) => {
    const all = await list()(tx)
    return all.find((w) => w.slug === slug) || all[0]
  }
}

export function fromID(id: string) {
  return async (tx: ReadTransaction) => {
    const result = await tx.get(`/workspace/${id}`)
    return result as unknown as Workspace.Type
  }
}
