import { createId } from "@paralleldrive/cuid2"
import { eq } from "drizzle-orm"
import { createSelectSchema } from "drizzle-zod"
import type { z } from "zod"

import { dbNow } from "../util/datetime"
import { useTransaction } from "../util/transaction"
import { zod } from "../util/zod"
import { account } from "./account.sql"

export * as Account from "./"

const Schema = createSelectSchema(account, {
  id: (schema) => schema.id.cuid2(),
  email: (schema) => schema.email.email(),
})

export type Type = z.infer<typeof Schema>

export const create = zod(
  Schema.pick({ email: true, id: true }).partial({
    id: true,
  }),
  (input) =>
    useTransaction(async (tx) => {
      const data: Type = {
        id: input.id ?? createId(),
        email: input.email,
        createdAt: dbNow(),
        updatedAt: dbNow(),
        deletedAt: null,
      }
      await tx.insert(account).values(data)
      return data
    }),
)

export const fromID = zod(Schema.pick({ id: true }), (input) =>
  useTransaction(async (tx) => {
    return tx
      .select()
      .from(account)
      .where(eq(account.id, input.id))
      .execute()
      .then((rows) => rows[0])
  }),
)

export const fromEmail = zod(Schema.pick({ email: true }), (input) =>
  useTransaction(async (tx) => {
    return tx
      .select()
      .from(account)
      .where(eq(account.email, input.email))
      .execute()
      .then((rows) => rows[0])
  }),
)
