import { List } from "@pwa/core/list/index.ts"

import { Server } from "./framework.ts"

export const server = new Server().expose("create_list", List.create)

export type ServerType = typeof server
