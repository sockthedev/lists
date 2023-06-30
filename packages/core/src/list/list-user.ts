import { createId } from "@paralleldrive/cuid2"
import { and, eq } from "drizzle-orm"
import { createSelectSchema } from "drizzle-zod"
import type { z } from "zod"

import { useActor } from "../actor.ts"
import { db } from "../drizzle/index.ts"
import { dbNow } from "../util/datetime.ts"
import { useTransaction } from "../util/transaction.ts"
import { zod } from "../util/zod.ts"
import { list_user } from "./list.sql.ts"

export * as ListUser from "./list-user.ts"

const Schema = createSelectSchema(list_user, {
  id: (schema) => schema.id.cuid2(),
  accountId: (schema) => schema.accountId.cuid2(),
  listId: (schema) => schema.listId.cuid2(),
})

export type Type = z.infer<typeof Schema>

// TODO: Refactor this to take into consideration a list owner account vs system actor
export const create = zod(
  Schema.pick({ listId: true, id: true, role: true }).partial({
    id: true,
    role: true,
  }),
  async (input) => {
    const actor = useActor()
    if (actor.type !== "account") {
      throw new Error("Not authorized")
    }
    const id = input.id ?? createId()
    const now = dbNow()
    const data: Type = {
      id,
      accountId: actor.properties.accountId,
      role: input.role ?? "viewer",
      listId: input.listId,
      createdAt: now,
      updatedAt: now,
    }
    await useTransaction(async (tx) => {
      await tx.insert(list_user).values(data)
      return id
    })
    return data
  },
)

export const fromId = zod(Schema.pick({ id: true }), async (input) => {
  const actor = useActor()
  if (actor.type === "public") {
    throw new Error("Not authorized")
  }
  return db.transaction(async (tx) => {
    return actor.type === "system"
      ? tx
          .select()
          .from(list_user)
          .where(eq(list_user.id, input.id))
          .execute()
          .then((rows) => rows[0])
      : tx
          .select()
          .from(list_user)
          .where(
            and(
              eq(list_user.id, input.id),
              eq(list_user.accountId, actor.properties.accountId),
            ),
          )
          .execute()
          .then((rows) => rows[0])
  })
})
