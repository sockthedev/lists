import {
  mysqlTable,
  primaryKey,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core"

import { datetimes, id } from "../util/sql.ts"

export const account = mysqlTable(
  "account",
  {
    ...id,
    email: varchar("email", { length: 255 }).notNull(),
    ...datetimes,
  },
  (user) => ({
    primary: primaryKey(user.id),
    email: uniqueIndex("email").on(user.email),
  }),
)
