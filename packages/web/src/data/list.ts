import type { List } from "@pwa/core/list/index.ts"
import type { ReadTransaction } from "replicache"

export * as ListStore from "./list.ts"

export function list() {
  return async (tx: ReadTransaction) => {
    const result = await tx.scan({ prefix: `/list/` }).toArray()
    return (result || []) as unknown as List.Type[]
  }
}

export function fromID(id: string) {
  return async (tx: ReadTransaction) => {
    const result = await tx.get(`/list/${id}`)
    return result as unknown as List.Type
  }
}
