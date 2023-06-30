import type { List } from "@lists/core/list/index.ts"
import type { ReadTransaction } from "replicache"

export * as ListUserStore from "./list-user.ts"

export function key(input: { id: string }) {
  return `/list-user/${input.id}`
}

export function all() {
  return async (tx: ReadTransaction) => {
    const result = await tx.scan({ prefix: `/list-user/` }).toArray()
    return (result || []) as unknown as List.Type[]
  }
}

export function fromId(id: string) {
  return async (tx: ReadTransaction) => {
    const result = await tx.get(`/list-user/${id}`)
    return result as unknown as List.Type
  }
}
