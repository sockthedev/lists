import type { StackContext } from "sst/constructs"
import { StaticSite, use } from "sst/constructs"

import { API } from "./api"
import { Auth } from "./auth"
import { DNS } from "./dns"
import { Realtime } from "./realtime"

export function Web(ctx: StackContext) {
  const dns = use(DNS)
  const api = use(API)
  const auth = use(Auth)
  const realtime = use(Realtime)

  const web = new StaticSite(ctx.stack, "web", {
    path: "./packages/web",
    buildOutput: "./dist",
    buildCommand: "pnpm run build",
    customDomain: {
      domainName: dns.domain,
      hostedZone: dns.zone,
    },
    environment: {
      VITE_API_URL: api.customDomainUrl || api.url,
      VITE_AUTH_URL: auth.url,
      VITE_IOT_HOST: realtime.endpointAddress,
      VITE_STAGE: ctx.stack.stage,
    },
  })

  ctx.stack.addOutputs({
    WebUrl: web.customDomainUrl,
  })
}
