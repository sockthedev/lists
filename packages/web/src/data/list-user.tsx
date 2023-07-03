import type { List } from "@lists/core/list/index.ts"
import type { ReadTransaction } from "replicache"

export * as ListUserStore from "./list-user.tsx"

const prefix = "/list-user/"

function itemKey(input: { id: string }) {
  return `${prefix}${input.id}`
}

export async function all(tx: ReadTransaction) {
  const result = await tx.scan({ prefix }).toArray()
  return (result || []) as unknown as List.Type[]
}

export async function fromId(tx: ReadTransaction, input: { id: string }) {
  const result = await tx.get(itemKey(input))
  return result as unknown as List.Type
}
