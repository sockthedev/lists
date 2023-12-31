import type { StackContext } from "sst/constructs"
import { Api, use } from "sst/constructs"

import { Auth } from "./auth.ts"
import { DNS } from "./dns.ts"
import { Events } from "./events.ts"
import { Secrets } from "./secrets.ts"

export function API(ctx: StackContext) {
  const auth = use(Auth)
  const bus = use(Events)
  const dns = use(DNS)
  const secrets = use(Secrets)

  const api = new Api(ctx.stack, "api", {
    defaults: {
      function: {
        bind: [auth, ...Object.values(secrets.database), bus],
      },
    },
    customDomain: {
      domainName: `api.${dns.domain}`,
      hostedZone: dns.zone,
    },
    routes: {
      "POST /replicache/pull": "packages/functions/src/replicache/pull.handler",
      "POST /replicache/push": "packages/functions/src/replicache/push.handler",
    },
  })

  ctx.stack.addOutputs({
    ApiEndpoint: api.customDomainUrl,
    Output: "",
  })

  return api
}
