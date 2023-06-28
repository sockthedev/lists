import { createId } from "@paralleldrive/cuid2"
import { eq } from "drizzle-orm"
import { createSelectSchema } from "drizzle-zod"
import type { z } from "zod"

import { db } from "../drizzle/index.ts"
import { dbNow } from "../util/datetime.ts"
import { useTransaction } from "../util/transaction.ts"
import { zod } from "../util/zod.ts"
import { workspace } from "./workspace.sql.ts"

export * as Workspace from "./index.ts"

const Schema = createSelectSchema(workspace, {
  id: (schema) => schema.id.cuid2(),
})

export type Type = z.infer<typeof Schema>

export const create = zod(
  Schema.pick({ slug: true, id: true }).partial({
    id: true,
    slug: true,
  }),
  (input) =>
    useTransaction(async (tx) => {
      const id = input.id ?? createId()
      const data: Type = {
        id,
        slug: input.slug ?? id,
        createdAt: dbNow(),
        updatedAt: dbNow(),
        deletedAt: null,
      }
      await tx.insert(workspace).values(data)
      return data
    }),
)

export const fromID = zod(Schema.shape.id, (id) =>
  db.transaction((tx) =>
    tx
      .select()
      .from(workspace)
      .where(eq(workspace.id, id))
      .execute()
      .then((rows) => rows[0]),
  ),
)
