import { List } from "@lists/core/list/index.ts"
import { Item } from "@lists/core/list/item.ts"
import { z } from "zod"

import { Server } from "./framework.ts"

export const server = new Server()
  .mutation(
    "create_list",
    {
      id: z.string(),
      name: z.string(),
    },
    async (input) => {
      const list = await List.create(input)
      return list
    },
  )
  .mutation(
    "create_item",
    {
      id: z.string(),
      description: z.string(),
      listId: z.string(),
    },
    async (input) => {
      const item = await Item.create(input)
      return item
    },
  )

export type ServerType = typeof server
