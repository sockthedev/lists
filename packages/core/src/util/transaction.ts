import type { MySqlTransaction } from "drizzle-orm/mysql-core"
import type {
  PlanetScalePreparedQueryHKT,
  PlanetscaleQueryResultHKT,
} from "drizzle-orm/planetscale-serverless"
import { Context } from "sst/context"

import { db } from "../drizzle/index.ts"

export type Transaction = MySqlTransaction<
  PlanetscaleQueryResultHKT,
  PlanetScalePreparedQueryHKT,
  any,
  any
>

const TransactionContext = Context.create<{
  tx: Transaction
  effects: (() => void | Promise<void>)[]
}>()

export function useTransaction<T>(callback: (trx: Transaction) => Promise<T>) {
  try {
    const { tx } = TransactionContext.use()
    try {
      return callback(tx)
    } catch (err) {
      throw err
    }
  } catch {
    return db.transaction(
      async (tx) => {
        const effects: (() => void | Promise<void>)[] = []
        TransactionContext.provide({ tx, effects: effects })
        try {
          const result = await callback(tx)
          await Promise.all(effects.map((x) => x()))
          return result
        } catch (err) {
          console.error(err)
          throw err
        }
      },
      {
        isolationLevel: "serializable",
      },
    )
  }
}

export function createTransactionEffect(effect: () => void | Promise<void>) {
  const { effects } = TransactionContext.use()
  console.log("🤖 Transaction: pushing effects", effect)
  effects.push(effect)
}
