import type { StackContext } from "sst/constructs"
import { use } from "sst/constructs"
import { Auth as SSTAuth } from "sst/constructs/future"

import { DNS } from "./dns"
import { Secrets } from "./secrets"

export function Auth(ctx: StackContext) {
  const dns = use(DNS)
  const { google, database } = use(Secrets)

  const auth = new SSTAuth(ctx.stack, "auth", {
    authenticator: {
      handler: "packages/functions/src/auth.handler",
      bind: [
        google.GOOGLE_CLIENT_ID,
        google.GOOGLE_CLIENT_SECRET,
        database.PLANETSCALE_PASSWORD,
        database.PLANETSCALE_USERNAME,
      ],
    },
    customDomain: {
      domainName: `auth.${dns.domain}`,
      hostedZone: dns.zone,
    },
  })

  ctx.stack.addOutputs({
    AuthEndpoint: auth.url,
  })

  return auth
}
