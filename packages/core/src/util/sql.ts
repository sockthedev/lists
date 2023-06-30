import { char, datetime } from "drizzle-orm/mysql-core"

export { createId } from "@paralleldrive/cuid2"

export const cuid = (name: string) => char(name, { length: 24 })

export const id = {
  id: cuid("id").notNull(),
}

export const timestamps = {
  createdAt: datetime("created_at", {
    mode: "string",
  }).notNull(),
  updatedAt: datetime("updated_at", {
    mode: "string",
  }).notNull(),
}
