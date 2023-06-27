import type { StackContext } from "sst/constructs"
import { Config } from "sst/constructs"

export function Params(ctx: StackContext) {
  return {
    database: Config.Parameter.create(ctx.stack, {
      REPLICACHE_LICENCE_KEY: 234,
    }),
  }
}
