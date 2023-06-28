import type { SSTConfig } from "sst"

import { API } from "./stacks/api.ts"
import { Auth } from "./stacks/auth.ts"
import { DNS } from "./stacks/dns.ts"
import { Events } from "./stacks/events.ts"
import { Realtime } from "./stacks/realtime.ts"
import { Secrets } from "./stacks/secrets.ts"
import { Web } from "./stacks/web.ts"

export default {
  config(input) {
    return {
      name: "lists",
      region: input.stage === "production" ? "us-east-1" : "ap-southeast-1",
      profile: "sockthedev",
    }
  },
  stacks(app) {
    if (app.stage !== "production") {
      app.setDefaultRemovalPolicy("destroy")
    }

    app.setDefaultFunctionProps({
      runtime: "nodejs16.x",
      nodejs: {
        format: "esm",
      },
      memorySize: "512 MB",
      logRetention: "one_day",
    })

    app
      .stack(DNS)
      .stack(Secrets)
      .stack(Auth)
      .stack(Events)
      .stack(API)
      .stack(Realtime)
      .stack(Web)
  },
} satisfies SSTConfig
