import { Server } from "./framework.ts"

export const server = new Server()

// .mutation(
//   "app_stage_sync",
//   { stageID: z.string() },
//   async (input) => await App.Stage.Events.Updated.publish(input),
// )
// .expose("app_create", App.create)

export type ServerType = typeof server
