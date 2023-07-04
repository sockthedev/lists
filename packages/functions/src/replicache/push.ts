import { useActor } from "@lists/core/actor.ts"
import { Realtime } from "@lists/core/realtime/index.ts"
import { Replicache } from "@lists/core/replicache/index.ts"
import { useTransaction } from "@lists/core/util/transaction.ts"
import { ApiHandler, useJsonBody } from "sst/node/api"

import { useApiAuth } from "../api.ts"
import { log } from "../log.ts"
import { server } from "./server.ts"

const clog = log.context("replicache/push")

export const handler = ApiHandler(async () => {
  await useApiAuth()

  clog.debug("Pushing for", useActor())

  // TODO: We don't actually have strong auth guards within the domain models

  // TODO: Use zod to safe parse the body
  const body = useJsonBody()
  clog.debug("body", body)

  await useTransaction(async () => {
    let lastMutationId = await (async function () {
      const existingClient = await Replicache.fromId({ id: body.clientID })
      if (existingClient) return existingClient.lastMutationId
      const client = await Replicache.create({ id: body.clientID })
      return client.lastMutationId
    })()
    clog.debug("lastMutationId", lastMutationId)

    for (const mutation of body.mutations) {
      const nextMutationid = lastMutationId + 1

      if (mutation.id < nextMutationid) {
        clog.info(
          `Mutation ${mutation.id} has already been processed - skipping`,
        )
        continue
      }

      if (mutation.id > nextMutationid) {
        clog.warn(`Mutation ${mutation.id} is from the future - aborting`)
        break
      }

      const { args, name } = mutation
      try {
        await server.execute(name, args)
      } catch (ex) {
        console.error(ex)
      }

      lastMutationId = nextMutationid
    }

    await Replicache.setLastMutationId({
      id: body.clientID,
      lastMutationId,
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
