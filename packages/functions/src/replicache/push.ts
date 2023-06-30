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

  // TODO: We don't actually have strong auth guards within the domain models

  // TODO: Use zod to safe parse the body
  const body = useJsonBody()
  console.log("body", JSON.stringify(body, null, 2))

  await useTransaction(async () => {
    let lastMutationId = await (async function () {
      const existingClient = await Replicache.fromId({ id: body.clientID })
      if (existingClient) return existingClient.lastMutationId
      const client = await Replicache.create({ id: body.clientID })
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
      id: body.clientID,
      lastMutationId: lastMutationId,
    })
  })

  await Realtime.publish({
    topic: "poke",
    properties: {},
  })

  return {
    statusCode: 200,
  }
})
