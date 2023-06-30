import { List } from "@lists/core/list/index.ts"
import { z } from "zod"

import { Server } from "./framework.ts"

export const server = new Server().mutation(
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

export type ServerType = typeof server
