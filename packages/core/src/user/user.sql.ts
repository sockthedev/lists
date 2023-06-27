import {
  mysqlTable,
  primaryKey,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core"

import { datetimes, workspaceId } from "../util/sql"

export const user = mysqlTable(
  "user",
  {
    ...workspaceId,
    email: varchar("email", { length: 255 }).notNull(),
    ...datetimes,
  },
  (user) => ({
    primary: primaryKey(user.id, user.workspaceId),
    email: uniqueIndex("email").on(user.email, user.workspaceId),
  }),
)
