import type { List } from "@lists/core/list/index.ts"
import { dbNow } from "@lists/core/util/datetime.ts"
import type { ReadTransaction, WriteTransaction } from "replicache"

export * as ListStore from "./list.ts"

export function key(input: { id: string }) {
  return `/list/${input.id}`
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
  await tx.put(key({ id: input.id }), data)
  console.log("🌍 replicache/list/create", data)
}

export function all() {
  return async (tx: ReadTransaction) => {
    const result = await tx.scan({ prefix: `/list/` }).toArray()
    return (result as List.Type[]).sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt),
    )
  }
}

export function fromId(id: string) {
  return async (tx: ReadTransaction) => {
    const result = await tx.get(`/list/${id}`)
    return result as unknown as List.Type
  }
}
