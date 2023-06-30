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

const listId = {
  ...id,
  listId: cuid("list_id").notNull(),
}

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
    ...listId,
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
