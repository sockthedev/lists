import {
  datetime,
  mysqlTable,
  primaryKey,
  varchar,
} from "drizzle-orm/mysql-core"

import { datetimes, workspaceId } from "../util/sql"

export const todo = mysqlTable(
  "todo",
  {
    ...workspaceId,
    text: varchar("text", { length: 255 }).notNull(),
    doneAt: datetime("done_at", {
      mode: "string",
    }),
    ...datetimes,
  },
  (user) => ({
    primary: primaryKey(user.id, user.workspaceId),
  }),
)
