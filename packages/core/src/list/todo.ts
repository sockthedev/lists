import { createId } from "@paralleldrive/cuid2"
import { and, desc, eq, inArray } from "drizzle-orm"
import { createSelectSchema } from "drizzle-zod"
import type { z } from "zod"

import { useActor } from "../actor.ts"
import { dbNow } from "../util/datetime.ts"
import { useTransaction } from "../util/transaction.ts"
import { zod } from "../util/zod.ts"
import { list, list_user, todo } from "./list.sql.ts"

export * as Todo from "./todo.ts"

const Schema = createSelectSchema(todo, {
  id: (schema) => schema.id.cuid2(),
})

export type Type = z.infer<typeof Schema>

export const create = zod(
  Schema.pick({ listId: true, text: true, id: true }).partial({
    id: true,
  }),
  (input) => {
    const actor = useActor()
    if (actor.type !== "account") {
      throw new Error("Not authorized")
    }
    return useTransaction(async (tx) => {
      const [hasAccess] = await tx
        .select({ id: list.id })
        .from(list_user)
        .where(
          and(
            eq(list_user.listId, input.listId),
            eq(list_user.accountId, actor.properties.accountId),
            inArray(list_user.role, ["owner", "admin"]),
          ),
        )
        .execute()
      if (!hasAccess) {
        throw new Error("Not authorized")
      }
      const data: Type = {
        id: input.id ?? createId(),
        listId: input.listId,
        text: input.text,
        createdAt: dbNow(),
        updatedAt: dbNow(),
        doneAt: null,
      }
      await tx.insert(todo).values(data)
      return data
    })
  },
)

export const byList = zod(Schema.pick({ listId: true }), (input) => {
  return useTransaction(async (tx) => {
    return tx
      .select()
      .from(todo)
      .where(eq(todo.listId, input.listId))
      .orderBy(desc(todo.createdAt))
      .execute()
  })
})
