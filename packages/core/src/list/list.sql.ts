import { mysqlTable, primaryKey, varchar } from "drizzle-orm/mysql-core"

import { id, timestamps } from "../util/sql.ts"

export const list = mysqlTable(
  "list",
  {
    ...id,
    name: varchar("name", { length: 255 }).notNull(),
    ...timestamps,
  },
  (table) => ({
    primary: primaryKey(table.id),
  }),
)
