import { createId } from "@paralleldrive/cuid2"
import { and, eq } from "drizzle-orm"
import { createSelectSchema } from "drizzle-zod"
import type { z } from "zod"

import { useWorkspace } from "../actor.ts"
import { db } from "../drizzle/index.ts"
import { dbNow } from "../util/datetime.ts"
import { useTransaction } from "../util/transaction.ts"
import { zod } from "../util/zod.ts"
import { user } from "./user.sql.ts"

export * as User from "./index.ts"

const Schema = createSelectSchema(user, {
  id: (schema) => schema.id.cuid2(),
  email: (schema) => schema.email.email(),
})

export type Type = z.infer<typeof Schema>

export const create = zod(
  Schema.pick({ email: true, id: true }).partial({
    id: true,
  }),
  async (input) => {
    const id = input.id ?? createId()
    const now = dbNow()
    const data: Type = {
      id,
      email: input.email,
      workspaceId: useWorkspace(),
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    }
    await useTransaction(async (tx) => {
      await tx.insert(user).values(data)
      return id
    })
    return data
  },
)

export const fromID = zod(Schema.pick({ id: true }), async (input) =>
  db.transaction(async (tx) => {
    return tx
      .select()
      .from(user)
      .where(and(eq(user.id, input.id), eq(user.workspaceId, useWorkspace())))
      .execute()
      .then((rows) => rows[0])
  }),
)

export const fromEmail = zod(Schema.pick({ email: true }), async (input) =>
  db.transaction(async (tx) => {
    return tx
      .select()
      .from(user)
      .where(
        and(eq(user.email, input.email), eq(user.workspaceId, useWorkspace())),
      )
      .execute()
      .then((rows) => rows[0])
  }),
)
