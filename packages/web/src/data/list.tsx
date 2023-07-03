import type { List } from "@lists/core/list/index.ts"
import { dbNow } from "@lists/core/util/datetime.ts"
import type { ReadTransaction, WriteTransaction } from "replicache"

export * as ListStore from "./list.tsx"

const prefix = "/list/"

function itemKey(input: { id: string }) {
  return `${prefix}${input.id}`
}

export async function create(
  tx: WriteTransaction,
  input: Pick<List.Type, "id" | "name">,
) {
  const data: List.Type = {
    ...input,
    createdAt: dbNow(),
    updatedAt: dbNow(),
  }
  await tx.put(itemKey(input), data)
  console.log("🌍 replicache/list/create", data)
}

export async function all(tx: ReadTransaction) {
  const result = await tx.scan({ prefix }).toArray()
  return (result as List.Type[]).sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  )
}

export async function fromId(tx: ReadTransaction, input: { id: string }) {
  const result = await tx.get(itemKey(input))
  return result as unknown as List.Type
}
