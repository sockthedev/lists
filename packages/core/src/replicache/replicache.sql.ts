import {
  bigint,
  char,
  json,
  mysqlTable,
  primaryKey,
} from "drizzle-orm/mysql-core"

import type { Actor } from "../actor.ts"
import { datetimes, id } from "../util/sql.ts"

export const replicache_client = mysqlTable("replicache_client", {
  id: char("id", { length: 36 }).primaryKey(),
  lastMutationId: bigint("mutation_id", {
    mode: "number",
  })
    .default(0)
    .notNull(),
  ...datetimes,
})

export const replicache_cvr = mysqlTable(
  "replicache_cvr",
  {
    ...id,
    actor: json("actor").$type<Actor>(),
    data: json("data").$type<Record<string, string>>(),
    ...datetimes,
  },
  (table) => ({
    primary: primaryKey(table.id),
  }),
)
