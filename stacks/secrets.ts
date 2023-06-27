import type { StackContext } from "sst/constructs"
import { Config } from "sst/constructs"

export function Secrets(ctx: StackContext) {
  return {
    database: Config.Secret.create(
      ctx.stack,
      "PLANETSCALE_USERNAME",
      "PLANETSCALE_PASSWORD",
    ),
    google: Config.Secret.create(
      ctx.stack,
      "GOOGLE_CLIENT_ID",
      "GOOGLE_CLIENT_SECRET",
    ),
  }
}
