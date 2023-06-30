import {
  IoTDataPlaneClient,
  PublishCommand,
} from "@aws-sdk/client-iot-data-plane"
import { Config } from "sst/node/config"

import { useActor } from "../actor.ts"

export * as Realtime from "./index.ts"

const data = new IoTDataPlaneClient({})

export async function publish(input: { topic: string; properties: any }) {
  const actor = useActor()
  if (actor.type !== "account") {
    throw new Error("Not authorized")
  }
  await data.send(
    new PublishCommand({
      payload: Buffer.from(
        JSON.stringify({
          properties: input.properties,
          accountId: actor.properties.accountId,
        }),
      ),
      topic: `${Config.APP}/${Config.STAGE}/${actor.properties.accountId}/${input.topic}`,
    }),
  )
}
