import { iot, mqtt } from "aws-iot-device-sdk-v2"
import React from "react"
import invariant from "tiny-invariant"

import { useAuth } from "./auth.tsx"
import { bus } from "./bus.tsx"
import { useLists } from "./replicache-root.tsx"

let connectionId = 0

export function RealtimeProvider(props: { children: React.ReactNode }) {
  const { account } = useAuth()
  const lists = useLists()

  React.useEffect(() => {
    if (!account || lists.length === 0) {
      return
    }

    connectionId += 1

    let connection: mqtt.MqttClientConnection

    async function connectWS() {
      invariant(account, "Expected account to exist")

      const url = import.meta.env.VITE_IOT_HOST
      invariant(url, "VITE_IOT_HOST must be set")

      const config = iot.AwsIotMqttConnectionConfigBuilder.new_with_websockets()
        .with_clean_session(true)
        .with_client_id("client_" + Date.now().toString())
        .with_endpoint(url)
        .with_custom_authorizer(
          "",
          `${import.meta.env.VITE_STAGE}-pwa-authorizer`,
          "",
          account.token,
        )
        .with_keep_alive_seconds(60)
        .build()

      const client = new mqtt.MqttClient()
      connection = client.new_connection(config)
      connection.on("connect", async () => {
        console.log(`🤖 RealtimeProvider(${connectionId}): WS connected`)
        for (const list of lists) {
          console.log(
            `🤖 RealtimeProvider(${connectionId}): WS subscribing to`,
            list,
          )
          await connection.subscribe(
            `pwa/${import.meta.env.VITE_STAGE}/${list}/#`,
            mqtt.QoS.AtLeastOnce,
          )
        }
      })
      connection.on("interrupt", console.log)
      connection.on("error", console.log)
      connection.on("resume", console.log)
      connection.on("message", (fullTopic, payload) => {
        const splits = fullTopic.split("/")
        const listId = splits[2]
        invariant(listId, "No list id")
        const topic = splits[3]
        const message = new TextDecoder("utf8").decode(new Uint8Array(payload))
        const parsed = JSON.parse(message)
        if (topic === "poke") {
          bus.emit("poke", { listId })
        }
        console.log(
          `🤖 RealtimeProvider(${connectionId}): WS got message`,
          topic,
          parsed,
        )
      })
      connection.on("disconnect", console.log)
      await connection.connect()
    }

    connectWS().catch((err) => {
      console.error(`🤖 RealtimeProvider(${connectionId}): WS error`, err)
    })

    return () => {
      console.log(`🤖 RealtimeProvider(${connectionId}): disconnecting`)
      connection?.disconnect()
    }
  }, [account, lists])

  return props.children
}
