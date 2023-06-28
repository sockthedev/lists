import { createId } from "@paralleldrive/cuid2"
import { createSelectSchema } from "drizzle-zod"
import type { z } from "zod"

import { useWorkspace } from "../actor.ts"
import { dbNow } from "../util/datetime.ts"
import { useTransaction } from "../util/transaction.ts"
import { zod } from "../util/zod.ts"
import { todo } from "./todo.sql.ts"

export * as Todo from "./index.ts"

const Schema = createSelectSchema(todo, {
  id: (schema) => schema.id.cuid2(),
})

export type Type = z.infer<typeof Schema>

export const create = zod(
  Schema.pick({ text: true, id: true }).partial({
    id: true,
  }),
  (input) =>
    useTransaction(async (tx) => {
      const data: Type = {
        id: input.id ?? createId(),
        workspaceId: useWorkspace(),
        text: input.text,
        createdAt: dbNow(),
        updatedAt: dbNow(),
        deletedAt: null,
        doneAt: null,
      }
      await tx.insert(todo).values(data)
      return data
    }),
)
