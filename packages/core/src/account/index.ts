import { createId } from "@paralleldrive/cuid2"
import { eq } from "drizzle-orm"
import { createSelectSchema } from "drizzle-zod"
import invariant from "tiny-invariant"
import type { z } from "zod"

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
  (input) =>
    useTransaction(async (tx) => {
      const data: Type = {
        id: input.id ?? createId(),
        email: input.email,
        createdAt: dbNow(),
        updatedAt: dbNow(),
      }
      await tx.insert(account).values(data)
      return data
    }),
)

export const fromID = zod(Schema.pick({ id: true }), (input) =>
  useTransaction(async (tx) => {
    const [data] = await tx
      .select()
      .from(account)
      .where(eq(account.id, input.id))
      .execute()
    invariant(data, "Account not found")
    return data
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
