import { eq } from "drizzle-orm"
import { createSelectSchema } from "drizzle-zod"
import type { z } from "zod"

import { Realtime } from "../realtime/index.ts"
import { dbNow } from "../util/datetime.ts"
import { useTransaction } from "../util/transaction.ts"
import { zod } from "../util/zod.ts"
import { replicache_client } from "./replicache.sql.ts"

export * as Replicache from "./index.ts"

const Schema = createSelectSchema(replicache_client)

export type Type = z.infer<typeof Schema>

export const fromId = zod(Schema.pick({ id: true }), (input) =>
  useTransaction(async (tx) => {
    return tx
      .select()
      .from(replicache_client)
      .where(eq(replicache_client.id, input.id))
      .then((x) => x.at(0))
  }),
)

export const create = zod(Schema.pick({ id: true }), (input) =>
  useTransaction(async (tx) => {
    const client: Type = {
      id: input.id,
      lastMutationId: 0,
      createdAt: dbNow(),
      updatedAt: dbNow(),
    }
    await tx.insert(replicache_client).values(client)
    return client
  }),
)

export const setLastMutationId = zod(
  Schema.pick({
    id: true,
    lastMutationId: true,
  }),
  (input) =>
    useTransaction(async (tx) => {
      return tx
        .update(replicache_client)
        .set({
          lastMutationId: input.lastMutationId,
        })
        .where(eq(replicache_client.id, input.id))
    }),
)

export async function poke() {
  console.log("🤖 Replicache: sending poke")
  await Realtime.publish({ topic: "poke", properties: {} })
  console.log("🤖 Replicache: poke sent")
}
