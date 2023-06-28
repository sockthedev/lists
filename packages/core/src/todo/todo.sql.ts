import {
  datetime,
  index,
  mysqlTable,
  primaryKey,
  varchar,
} from "drizzle-orm/mysql-core"

import { listId, timestamps } from "../util/sql.ts"

export const todo = mysqlTable(
  "todo",
  {
    ...listId,
    text: varchar("text", { length: 255 }).notNull(),
    doneAt: datetime("done_at", {
      mode: "string",
    }),
    ...timestamps,
  },
  (user) => ({
    primary: primaryKey(user.id, user.listId),
    created: index("created").on(user.listId, user.createdAt),
  }),
)
