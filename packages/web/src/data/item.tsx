import type { Item } from "@lists/core/list/item.ts"
import { dbNow } from "@lists/core/util/datetime.ts"
import type { ReadTransaction, WriteTransaction } from "replicache"

export * as ItemStore from "./item.tsx"

const prefix = "/item/"

function itemKey(input: { id: string }) {
  return `${prefix}${input.id}`
}

export async function create(
  tx: WriteTransaction,
  input: Pick<Item.Type, "id" | "description" | "listId">,
) {
  const data: Item.Type = {
    ...input,
    createdAt: dbNow(),
    updatedAt: dbNow(),
    completedAt: null,
  }
  await tx.put(itemKey(input), data)
  console.log("🌍 replicache/item/create", data)
}

export async function byListId(tx: ReadTransaction, input: { listId: string }) {
  const result = await tx.scan({ prefix }).toArray()
  return (result as unknown as Item.Type[])
    .filter((item) => item.listId === input.listId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}
