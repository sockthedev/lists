import {
  IoTDataPlaneClient,
  PublishCommand,
} from "@aws-sdk/client-iot-data-plane"
import { Config } from "sst/node/config"

import { useList } from "../actor.ts"

export * as Realtime from "./index.ts"

const data = new IoTDataPlaneClient({})

export async function publish(input: { topic: string; properties: any }) {
  const listId = useList()
  await data.send(
    new PublishCommand({
      payload: Buffer.from(
        JSON.stringify({
          properties: input.properties,
          listId: listId,
        }),
      ),
      topic: `${Config.APP}/${Config.STAGE}/${listId}/${input.topic}`,
    }),
  )
}
