import { mysqlTable, primaryKey, varchar } from "drizzle-orm/mysql-core"

import { datetimes, id } from "../util/sql.ts"

export const workspace = mysqlTable(
  "workspace",
  {
    ...id,
    slug: varchar("slug", { length: 255 }).notNull(),
    ...datetimes,
  },
  (table) => ({
    primary: primaryKey(table.id),
  }),
)
