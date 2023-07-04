import { List } from "@lists/core/list/index.ts"
import { Item } from "@lists/core/list/item.ts"
import { z } from "zod"

import { log } from "../log.ts"
import { Server } from "./framework.ts"

const clog = log.context("replicache/server")

export const server = new Server()
  .mutation(
    "create_list",
    {
      id: z.string(),
      name: z.string(),
    },
    async (input) => {
      clog.debug("create_list", input)
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
      clog.debug("create_item", input)
      const item = await Item.create(input)
      return item
    },
  )

export type ServerType = typeof server
