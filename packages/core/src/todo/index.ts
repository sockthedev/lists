import { createId } from "@paralleldrive/cuid2"
import { createSelectSchema } from "drizzle-zod"
import type { z } from "zod"

import { useWorkspace } from "../actor"
import { dbNow } from "../util/datetime"
import { useTransaction } from "../util/transaction"
import { zod } from "../util/zod"
import { todo } from "./todo.sql"

export * as Todo from "./index"

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
