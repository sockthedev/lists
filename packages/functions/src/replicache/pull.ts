import { useActor, useList } from "@lists/core/actor.ts"
import { list } from "@lists/core/list/list.sql.ts"
import { Replicache } from "@lists/core/replicache/index.ts"
import { replicache_cvr } from "@lists/core/replicache/replicache.sql.ts"
import { todo } from "@lists/core/todo/todo.sql.ts"
import { user } from "@lists/core/user/user.sql.ts"
import { dbNow } from "@lists/core/util/datetime.ts"
import { createId } from "@lists/core/util/sql.ts"
import { useTransaction } from "@lists/core/util/transaction.ts"
import { and, eq, gt, inArray } from "drizzle-orm"
import { mapValues } from "remeda"
import { ApiHandler, useJsonBody } from "sst/node/api"

import { useApiAuth } from "../api.ts"

const VERSION = 1

export const handler = ApiHandler(async () => {
  await useApiAuth()
  const actor = useActor()

  if (actor.type === "public") {
    return {
      statusCode: 401,
    }
  }

  const body = useJsonBody()
  console.log("cookie", body.cookie)

  const lastSync =
    body.cookie && body.cookie.version === VERSION
      ? body.cookie.lastSync
      : new Date(0).toISOString()

  const oldCvrID =
    body.cookie && body.cookie.version === VERSION ? body.cookie.cvr : ""

  console.log("lastSync", lastSync)
  console.log("oldCvrID", oldCvrID)
  console.log("body", JSON.stringify(body, null, 2))

  const result = {
    patch: [] as any[],
    lastSync,
    cvr: oldCvrID,
  }

  return await useTransaction(async (tx) => {
    const [client, oldCvr] = await Promise.all([
      Replicache.fromId({ id: body.clientID }),
      // get old cvr
      (await tx
        .select({ data: replicache_cvr.data })
        .from(replicache_cvr)
        .where(eq(replicache_cvr.id, oldCvrID))
        .execute()
        .then((rows) => rows[0]?.data ?? {})) || {},
    ])

    if (actor.type === "user") {
      const listId = useList()

      console.log("syncing user", actor.properties)

      if (!oldCvrID) {
        result.patch.push({
          op: "clear",
        })
      }

      const tables = {
        list,
        user,
        todo,
      }

      const results: [string, { id: string; updatedAt: string }[]][] = []
      for (const [name, table] of Object.entries(tables)) {
        const rows = await tx
          .select({ id: table.id, updatedAt: table.updatedAt })
          .from(table)
          .where(and(eq("listId" in table ? table.listId : table.id, listId)))
          .execute()
        results.push([name, rows])
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
    } else if (actor.type === "account") {
      console.log("syncing account", actor.properties)
      if (new Date(lastSync).getTime() === 0) {
        result.patch.push({
          op: "clear",
        })
      }
      const users = await tx
        .select()
        .from(user)
        .where(
          and(
            eq(user.email, actor.properties.email),
            gt(user.updatedAt, lastSync),
          ),
        )
        .execute()

      const lists = await tx
        .select()
        .from(list)
        .leftJoin(user, eq(user.listId, list.id))
        .where(
          and(
            eq(user.email, actor.properties.email),
            gt(list.updatedAt, lastSync),
          ),
        )
        .execute()
        .then((rows) => rows.map((row) => row.list))
      console.log("lists", lists)

      result.patch.push(
        ...users.map((item) => ({
          op: "put",
          key: `/user/${item.id}`,
          value: item,
        })),
        ...lists.map((item) => ({
          op: "put",
          key: `/list/${item.id}`,
          value: item,
        })),
      )
      result.lastSync =
        [...lists, ...users].sort((a, b) =>
          b.updatedAt > a.updatedAt ? 1 : -1,
        )[0]?.updatedAt || lastSync
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
