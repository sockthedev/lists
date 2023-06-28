import {
  mysqlEnum,
  mysqlTable,
  primaryKey,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core"

import { listId, timestamps } from "../util/sql.ts"

export const user = mysqlTable(
  "user",
  {
    ...listId,
    email: varchar("email", { length: 255 }).notNull(),
    role: mysqlEnum("role", ["owner", "admin", "viewer"]).notNull(),
    ...timestamps,
  },
  (user) => ({
    primary: primaryKey(user.id, user.listId),
    email: uniqueIndex("email").on(user.email, user.listId),
  }),
)
