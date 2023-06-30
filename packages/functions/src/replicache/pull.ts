import { useActor } from "@lists/core/actor.ts"
import { list, list_user, todo } from "@lists/core/list/list.sql.ts"
import { Replicache } from "@lists/core/replicache/index.ts"
import { replicache_cvr } from "@lists/core/replicache/replicache.sql.ts"
import { dbNow } from "@lists/core/util/datetime.ts"
import { createId } from "@lists/core/util/sql.ts"
import { useTransaction } from "@lists/core/util/transaction.ts"
import { eq, inArray } from "drizzle-orm"
import { mapValues } from "remeda"
import { ApiHandler, useJsonBody } from "sst/node/api"

import { useApiAuth } from "../api.ts"

const VERSION = 1

export const handler = ApiHandler(async () => {
  await useApiAuth()

  const actor = useActor()

  if (actor.type !== "account") {
    return {
      statusCode: 401,
    }
  }

  console.log("syncing account", actor.properties)

  const body = useJsonBody()
  console.log("body", JSON.stringify(body, null, 2))

  const lastSync =
    body.cookie && body.cookie.version === VERSION
      ? body.cookie.lastSync
      : new Date(0).toISOString()
  console.log("lastSync", lastSync)

  const oldCvrID =
    body.cookie && body.cookie.version === VERSION ? body.cookie.cvr : ""
  console.log("oldCvrID", oldCvrID)

  const result = {
    patch: [] as any[],
    lastSync,
    cvr: oldCvrID,
  }

  return useTransaction(async (tx) => {
    const [client, oldCvr] = await Promise.all([
      Replicache.fromId({ id: body.clientID }),
      // get old cvr
      // TODO: Verify this the CVR actually belongs to the account
      (await tx
        .select({ data: replicache_cvr.data })
        .from(replicache_cvr)
        .where(eq(replicache_cvr.id, oldCvrID))
        .execute()
        .then((rows) => rows[0]?.data ?? {})) || {},
    ])

    if (!oldCvrID) {
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
        results.push([name, rows])
      } else if (table === list) {
        const rows = await tx
          .select({ id: table.id, updatedAt: table.updatedAt })
          .from(table)
          .innerJoin(list_user, eq(list_user.listId, table.id))
          .where(eq(list_user.accountId, actor.properties.accountId))
          .execute()
        results.push([name, rows])
      } else if (table === todo) {
        const rows = await tx
          .select({ id: table.id, updatedAt: table.updatedAt })
          .from(table)
          .innerJoin(list_user, eq(list_user.listId, table.listId))
          .where(eq(list_user.accountId, actor.properties.accountId))
          .execute()
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
      "toPut",
      mapValues(toPut, (value) => value.length),
    )
    console.log("toDel", oldCvr)

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
      const nextCvrID = createId()
      await tx
        .insert(replicache_cvr)
        .values({
          id: nextCvrID,
          data: nextCvr,
          actor,
          createdAt: dbNow(),
          updatedAt: dbNow(),
        })
        .execute()
      result.cvr = nextCvrID
    }

    return {
      statusCode: 200,
      // TODO: Can we get a Replicache type to represent this response?
      body: JSON.stringify({
        lastMutationID: client?.lastMutationId || 0,
        patch: result.patch,
        cookie: {
          version: VERSION,
          lastSync: result.lastSync,
          cvr: result.cvr,
        },
      }),
    }
  })
})
