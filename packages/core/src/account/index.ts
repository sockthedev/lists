import { createId } from "@paralleldrive/cuid2"
import { and, eq } from "drizzle-orm"
import { createSelectSchema } from "drizzle-zod"
import type { z } from "zod"

import { useActor } from "../actor.ts"
import { dbNow } from "../util/datetime.ts"
import { useTransaction } from "../util/transaction.ts"
import { zod } from "../util/zod.ts"
import { account } from "./account.sql.ts"

export * as Account from "./index.ts"

const Schema = createSelectSchema(account, {
  id: (schema) => schema.id.cuid2(),
  email: (schema) => schema.email.email(),
})

export type Type = z.infer<typeof Schema>

export const create = zod(
  Schema.pick({ email: true, id: true }).partial({
    id: true,
  }),
  (input) => {
    const actor = useActor()
    if (actor.type !== "system") {
      throw new Error("Not authorized")
    }
    return useTransaction(async (tx) => {
      const data: Type = {
        id: input.id ?? createId(),
        email: input.email,
        createdAt: dbNow(),
        updatedAt: dbNow(),
      }
      await tx.insert(account).values(data)
      return data
    })
  },
)

export const fromId = zod(Schema.pick({ id: true }), (input) => {
  const actor = useActor()
  if (actor.type === "public") {
    throw new Error("Not authorized")
  }

  return useTransaction(async (tx) => {
    const [data] = await tx
      .select()
      .from(account)
      .where(
        actor.type === "system"
          ? eq(account.id, input.id)
          : and(
              eq(account.id, input.id),
              eq(account.id, actor.properties.accountId),
            ),
      )
      .execute()
    return data
  })
})

export const fromEmail = zod(Schema.pick({ email: true }), (input) => {
  const actor = useActor()
  if (actor.type === "public") {
    throw new Error("Not authorized")
  }

  return useTransaction(async (tx) => {
    const [data] = await tx
      .select()
      .from(account)
      .where(
        actor.type === "system"
          ? eq(account.email, input.email)
          : and(
              eq(account.email, input.email),
              eq(account.id, actor.properties.accountId),
            ),
      )
      .execute()
    return data
  })
})
