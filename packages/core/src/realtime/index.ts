import {
  IoTDataPlaneClient,
  PublishCommand,
} from "@aws-sdk/client-iot-data-plane"
import { Config } from "sst/node/config"

import { useWorkspace } from "../actor"

export * as Realtime from "."

const data = new IoTDataPlaneClient({})

export async function publish(input: { topic: string; properties: any }) {
  const workspaceId = useWorkspace()
  await data.send(
    new PublishCommand({
      payload: Buffer.from(
        JSON.stringify({
          properties: input.properties,
          workspaceId: workspaceId,
        }),
      ),
      topic: `${Config.APP}/${Config.STAGE}/${workspaceId}/${input.topic}`,
    }),
  )
}
