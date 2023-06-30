import { Context } from "sst/context"
import { z } from "zod"

export const publicActorSchema = z.object({
  type: z.literal("public"),
  properties: z.object({}),
})
export type PublicActor = z.infer<typeof publicActorSchema>

export const accountActorSchema = z.object({
  type: z.literal("account"),
  properties: z.object({
    accountId: z.string().cuid2(),
  }),
})
export type AccountActor = z.infer<typeof accountActorSchema>

export const systemActorSchema = z.object({
  type: z.literal("system"),
  properties: z.object({}),
})
export type SystemActor = z.infer<typeof systemActorSchema>

export const actorSchema = z.discriminatedUnion("type", [
  accountActorSchema,
  publicActorSchema,
  systemActorSchema,
])
export type Actor = z.infer<typeof actorSchema>

const ActorContext = Context.create<Actor>("actor")

export const useActor = ActorContext.use
export const provideActor = ActorContext.provide

export function assertActor<T extends Actor["type"]>(type: T) {
  const actor = useActor()
  if (actor.type !== type) {
    throw new Error(`Expected actor type ${type}, got ${actor.type}`)
  }

  return actor as Extract<Actor, { type: T }>
}
