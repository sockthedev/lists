import type { SSTConfig } from "sst"

import { API } from "./stacks/api"
import { Auth } from "./stacks/auth"
import { DNS } from "./stacks/dns"
import { Events } from "./stacks/events"
import { Realtime } from "./stacks/realtime"
import { Secrets } from "./stacks/secrets"
import { Web } from "./stacks/web"

export default {
  config(input) {
    return {
      name: "pwa",
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
