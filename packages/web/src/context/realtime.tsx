import { iot, mqtt } from "aws-iot-device-sdk-v2"
import React from "react"
import invariant from "tiny-invariant"

import { useAccount } from "./auth.tsx"
import { bus } from "./bus.tsx"

let connectionId = 0

export function RealtimeProvider(props: { children: React.ReactElement }) {
  const account = useAccount()

  React.useEffect(() => {
    if (!account) {
      return
    }

    let connection: mqtt.MqttClientConnection

    async function connect() {
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
      connectionId += 1
      connection = client.new_connection(config)
      connection.on("connect", async () => {
        console.log(`🤖 Realtime(${connectionId}): WS connected`)
        console.log(
          `🤖 Realtime(${connectionId}): WS subscribing to`,
          account.accountId,
        )
        await connection.subscribe(
          `pwa/${import.meta.env.VITE_STAGE}/${account.accountId}/#`,
          mqtt.QoS.AtLeastOnce,
        )
      })
      connection.on("interrupt", console.log)
      connection.on("error", console.log)
      connection.on("resume", console.log)
      connection.on("message", (fullTopic, payload) => {
        const [, , accountId, topic] = fullTopic.split("/")
        invariant(accountId, "No account id")
        invariant(topic, "No topic")
        const message = new TextDecoder("utf8").decode(new Uint8Array(payload))
        const parsed = JSON.parse(message)
        if (topic === "poke") {
          bus.emit("poke", {})
        }
        console.log(
          `🤖 Realtime(${connectionId}): WS got message`,
          topic,
          parsed,
        )
      })
      connection.on("disconnect", console.log)
      await connection.connect()
    }

    connect().catch((err) => {
      console.error(`🤖 Realtime(${connectionId}): WS error`, err)
    })

    return () => {
      console.log(`🤖 Realtime(${connectionId}): disconnecting`)
      connection?.disconnect()
    }
  }, [account])

  return props.children
}
