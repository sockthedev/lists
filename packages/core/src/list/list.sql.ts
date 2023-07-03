import {
  datetime,
  index,
  mysqlEnum,
  mysqlTable,
  primaryKey,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core"

import { cuid, id, timestamps } from "../util/sql.ts"

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

export const list_user = mysqlTable(
  "list_user",
  {
    ...id,
    listId: cuid("list_id").notNull(),
    accountId: cuid("account_id").notNull(),
    role: mysqlEnum("role", ["owner", "admin", "viewer"]).notNull(),
    ...timestamps,
  },
  (list_user) => ({
    primary: primaryKey(list_user.id),
    accountLists: uniqueIndex("account").on(
      list_user.accountId,
      list_user.listId,
    ),
  }),
)

export const item = mysqlTable(
  "item",
  {
    ...id,
    listId: cuid("list_id").notNull(),
    description: varchar("text", { length: 255 }).notNull(),
    completedAt: datetime("completed_at", {
      mode: "string",
    }),
    ...timestamps,
  },
  (user) => ({
    primary: primaryKey(user.id, user.listId),
    listByCreated: index("list_by_created").on(user.listId, user.createdAt),
  }),
)
