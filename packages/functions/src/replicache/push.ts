import { useActor } from "@lists/core/actor.ts"
import { Realtime } from "@lists/core/realtime/index.ts"
import { Replicache } from "@lists/core/replicache/index.ts"
import { useTransaction } from "@lists/core/util/transaction.ts"
import { ApiHandler, useJsonBody } from "sst/node/api"

import { useApiAuth } from "../api.ts"
import { server } from "./server.ts"

export const handler = ApiHandler(async () => {
  await useApiAuth()

  console.log("Pushing for", useActor())

  const body = useJsonBody()

  await useTransaction(async () => {
    let lastMutationId = await (async function () {
      const result = await Replicache.fromId(body.clientID)
      if (result) return result.lastMutationId
      const client = await Replicache.create(body.clientID)
      return client.lastMutationId
    })()

    for (const mutation of body.mutations) {
      const expectedMutationID = lastMutationId + 1

      if (mutation.id < expectedMutationID) {
        console.log(
          `Mutation ${mutation.id} has already been processed - skipping`,
        )
        continue
      }

      if (mutation.id > expectedMutationID) {
        console.warn(`Mutation ${mutation.id} is from the future - aborting`)
        break
      }

      const { args, name } = mutation
      try {
        await server.execute(name, args)
      } catch (ex) {
        console.error(ex)
      }

      lastMutationId = expectedMutationID
    }

    await Replicache.setLastMutationId({
      id: body.clientId,
      lastMutationId: lastMutationId,
    })
  })

  await Realtime.publish({ topic: "poke", properties: {} })

  return {
    statusCode: 200,
  }
})
