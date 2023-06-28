import {
  mysqlEnum,
  mysqlTable,
  primaryKey,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core"

import { datetimes, workspaceId } from "../util/sql.ts"

export const user = mysqlTable(
  "user",
  {
    ...workspaceId,
    email: varchar("email", { length: 255 }).notNull(),
    role: mysqlEnum("role", ["owner", "admin", "viewer"]).notNull(),
    ...datetimes,
  },
  (user) => ({
    primary: primaryKey(user.id, user.workspaceId),
    email: uniqueIndex("email").on(user.email, user.workspaceId),
  }),
)
