import type { StackContext } from "sst/constructs"
import { EventBus } from "sst/constructs"

export function Events({ stack }: StackContext) {
  const bus = new EventBus(stack, "bus", {
    defaults: {
      retries: 10,
    },
  })

  // const secrets = use(Secrets)

  // bus.subscribe("app.stage.connected", {
  //   handler: "packages/functions/src/events/app-stage-connected.handler",
  //   bind: [...Object.values(secrets.database)],
  //   permissions: ["sts"],
  //   environment: {
  //     EVENT_BUS_ARN: bus.eventBusArn,
  //   },
  // })

  return bus
}
