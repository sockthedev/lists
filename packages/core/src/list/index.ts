import { createId } from "@paralleldrive/cuid2"
import { eq } from "drizzle-orm"
import { createSelectSchema } from "drizzle-zod"
import invariant from "tiny-invariant"
import type { z } from "zod"

import { db } from "../drizzle/index.ts"
import { dbNow } from "../util/datetime.ts"
import { useTransaction } from "../util/transaction.ts"
import { zod } from "../util/zod.ts"
import { list } from "./list.sql.ts"

export * as List from "./index.ts"

const Schema = createSelectSchema(list, {
  id: (schema) => schema.id.cuid2(),
})

export type Type = z.infer<typeof Schema>

export const create = zod(
  Schema.pick({ name: true, id: true }).partial({
    id: true,
  }),
  (input) =>
    useTransaction(async (tx) => {
      const data: Type = {
        id: input.id ?? createId(),
        name: input.name,
        createdAt: dbNow(),
        updatedAt: dbNow(),
      }
      await tx.insert(list).values(data)
      return data
    }),
)

export const fromID = zod(Schema.shape.id, (id) =>
  db.transaction(async (tx) => {
    const [data] = await tx.select().from(list).where(eq(list.id, id)).execute()
    invariant(data, "List not found")
    return data
  }),
)
