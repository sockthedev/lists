import { createId } from "@paralleldrive/cuid2"
import { eq } from "drizzle-orm"
import { createSelectSchema } from "drizzle-zod"
import type { z } from "zod"

import { useActor } from "../actor.ts"
import { db } from "../drizzle/index.ts"
import { dbNow } from "../util/datetime.ts"
import { useTransaction } from "../util/transaction.ts"
import { zod } from "../util/zod.ts"
import { list, list_user } from "./list.sql.ts"

export * as List from "./index.ts"

const Schema = createSelectSchema(list, {
  id: (schema) => schema.id.cuid2(),
})

export type Type = z.infer<typeof Schema>

export const create = zod(
  Schema.pick({ name: true, id: true }).partial({
    id: true,
  }),
  (input) => {
    const actor = useActor()
    if (actor.type !== "account") {
      throw new Error("Not authorized")
    }
    return useTransaction(async (tx) => {
      const data: Type = {
        id: input.id ?? createId(),
        name: input.name,
        createdAt: dbNow(),
        updatedAt: dbNow(),
      }
      await tx.insert(list).values(data)
      await tx.insert(list_user).values({
        id: createId(),
        accountId: actor.properties.accountId,
        role: "owner",
        listId: data.id,
        createdAt: dbNow(),
        updatedAt: dbNow(),
      })
      return data
    })
  },
)

export const fromId = zod(Schema.shape.id, (id) => {
  const actor = useActor()
  if (actor.type === "public") {
    throw new Error("Not authorized")
  }
  return db.transaction((tx) => {
    return actor.type === "system"
      ? tx
          .select()
          .from(list)
          .where(eq(list.id, id))
          .execute()
          .then((rows) => rows[0])
      : tx
          .select({
            id: list.id,
            createdAt: list.createdAt,
            updatedAt: list.updatedAt,
            name: list.name,
          })
          .from(list)
          .innerJoin(
            list_user,
            eq(list_user.accountId, actor.properties.accountId),
          )
          .where(eq(list.id, id))
          .execute()
          .then((rows) => rows[0])
  })
})
