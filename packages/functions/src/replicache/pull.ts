import { useActor } from "@lists/core/actor.ts"
import { list, list_user, todo } from "@lists/core/list/list.sql.ts"
import { Replicache } from "@lists/core/replicache/index.ts"
import { replicache_cvr } from "@lists/core/replicache/replicache.sql.ts"
import { dbNow } from "@lists/core/util/datetime.ts"
import { createId } from "@lists/core/util/sql.ts"
import { useTransaction } from "@lists/core/util/transaction.ts"
import { eq, inArray } from "drizzle-orm"
import { mapValues } from "remeda"
import type { PatchOperation } from "replicache"
import { ApiHandler, useJsonBody } from "sst/node/api"
import { z } from "zod"

import { useApiAuth } from "../api.ts"

// Changing this value will cause any previous clients to completely resync. Which is handy if we make significant changes to the schema/data.
const VERSION = 1

const pullRequestSchema = z.object({
  clientID: z.string(),
  profileID: z.string(),
  cookie: z
    .object({
      version: z.number(),
      cvr: z.string(),
    })
    .nullable(),
  lastMutationID: z.number(),
  pullVersion: z.number(),
  schemaVersion: z.string(),
})

export const handler = ApiHandler(async () => {
  await useApiAuth()

  const actor = useActor()

  if (actor.type !== "account") {
    return {
      statusCode: 401,
    }
  }

  console.log("🐑 replicache/pull: syncing account", actor.properties)

  const body = useJsonBody()
  console.log("🐑 replicache/pull: body", JSON.stringify(body, null, 2))
  const pullRequest = pullRequestSchema.parse(body)

  const oldCvrId =
    pullRequest.cookie && pullRequest.cookie.version === VERSION
      ? pullRequest.cookie.cvr
      : ""
  console.log("🐑 replicache/pull: oldCvrId", oldCvrId)

  const result: { patch: PatchOperation[]; cvr: string } = {
    patch: [],
    cvr: oldCvrId,
  }

  return useTransaction(async (tx) => {
    const [client, oldCvr] = await Promise.all([
      Replicache.fromId({ id: pullRequest.clientID }),
      // get old cvr
      // TODO: Verify this the CVR actually belongs to the account
      (await tx
        .select({ data: replicache_cvr.data })
        .from(replicache_cvr)
        .where(eq(replicache_cvr.id, oldCvrId))
        .execute()
        .then((rows) => rows[0]?.data ?? {})) || {},
    ])

    console.log("🐑 replicache/pull: client", client)
    console.log("🐑 replicache/pull: oldCvr", oldCvr)

    if (!oldCvrId) {
      result.patch.push({
        op: "clear",
      })
    }

    const tables = {
      list,
      list_user,
      todo,
    }

    const results: [string, { id: string; updatedAt: string }[]][] = []
    for (const [name, table] of Object.entries(tables)) {
      if (table === list_user) {
        const rows = await tx
          .select({ id: table.id, updatedAt: table.updatedAt })
          .from(table)
          .where(eq(list_user.accountId, actor.properties.accountId))
          .execute()
        console.log("🐑 replicache/pull: found list_users", rows)
        results.push([name, rows])
      } else if (table === list) {
        const rows = await tx
          .select({ id: table.id, updatedAt: table.updatedAt })
          .from(table)
          .innerJoin(list_user, eq(list_user.listId, table.id))
          .where(eq(list_user.accountId, actor.properties.accountId))
          .execute()
        console.log("🐑 replicache/pull: found lists", rows)
        results.push([name, rows])
      } else if (table === todo) {
        const rows = await tx
          .select({ id: table.id, updatedAt: table.updatedAt })
          .from(table)
          .innerJoin(list_user, eq(list_user.listId, table.listId))
          .where(eq(list_user.accountId, actor.properties.accountId))
          .execute()
        console.log("🐑 replicache/pull: found todos", rows)
        results.push([name, rows])
      } else {
        throw new Error(`Unhandled table ${name}`)
      }
    }

    const toPut: Record<string, string[]> = {}
    const nextCvr: Record<string, string> = {}
    for (const [name, rows] of results) {
      const arr = [] as string[]
      for (const row of rows) {
        const key = `/${name}/${row.id}`
        if (oldCvr[key] !== row.updatedAt) {
          arr.push(row.id)
        }
        delete oldCvr[key]
        nextCvr[key] = row.updatedAt
      }
      toPut[name] = arr
    }
    console.log(
      "🐑 replicache/pull: toPut",
      mapValues(toPut, (value) => value.length),
    )
    console.log("🐑 replicache/pull: toDel", oldCvr)

    // new data
    for (const [name, ids] of Object.entries(toPut)) {
      if (!ids.length) continue
      const table = tables[name as keyof typeof tables]
      const rows = await tx
        .select()
        .from(table)
        .where(inArray(table.id, ids))
        .execute()
      for (const row of rows) {
        result.patch.push({
          op: "put",
          key: `/${name}/${row.id}`,
          value: row,
        })
      }
    }

    // remove deleted data
    for (const [key] of Object.entries(oldCvr)) {
      result.patch.push({
        op: "del",
        key,
      })
    }

    if (result.patch.length > 0) {
      const nextCvrId = createId()
      await tx
        .insert(replicache_cvr)
        .values({
          id: nextCvrId,
          data: nextCvr,
          actor,
          createdAt: dbNow(),
          updatedAt: dbNow(),
        })
        .execute()
      result.cvr = nextCvrId
      console.log("🐑 replicache/pull: inserted cvr", nextCvrId)
    }

    return {
      statusCode: 200,
      // TODO: Can we get a Replicache type to represent this response?
      body: JSON.stringify({
        lastMutationID: client?.lastMutationId || 0,
        patch: result.patch,
        cookie: {
          version: VERSION,
          cvr: result.cvr,
        },
      }),
    }
  })
})
