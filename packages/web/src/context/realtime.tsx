import { iot, mqtt } from "aws-iot-device-sdk-v2"
import React from "react"
import { Replicache } from "replicache"
import invariant from "tiny-invariant"

import { WorkspaceStore } from "@/data/workspace"

import { useAuth } from "./auth"
import { bus } from "./bus"

let connectionId = 0

export function RealtimeProvider() {
  const { account } = useAuth()
  const [workspaces, setWorkspaces] = React.useState<string[]>([])

  React.useEffect(() => {
    if (!account) {
      setWorkspaces([])
    }
  }, [account])

  React.useEffect(() => {
    if (!account) {
      return
    }

    const replicache = new Replicache({
      name: account.accountId,
      auth: `Bearer ${account.token}`,
      licenseKey: "l75bdf9ee8d1e453697e2948b3114d44c",
      pullURL: import.meta.env.VITE_API_URL + "/replicache/pull",
      pushURL: import.meta.env.VITE_API_URL + "/replicache/push",
    })

    replicache.subscribe(WorkspaceStore.list(), {
      onData(list) {
        console.log("🤖 RealtimeProvider(replicache): workspaces", list)
        setWorkspaces(list.map((w) => w.id))
      },
    })

    return () => {
      replicache.close()
    }
  }, [account])

  React.useEffect(() => {
    if (!account || workspaces.length === 0) {
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
        for (const workspace of workspaces) {
          console.log(
            `🤖 RealtimeProvider(${connectionId}): WS subscribing to`,
            workspace,
          )
          await connection.subscribe(
            `pwa/${import.meta.env.VITE_STAGE}/${workspace}/#`,
            mqtt.QoS.AtLeastOnce,
          )
        }
      })
      connection.on("interrupt", console.log)
      connection.on("error", console.log)
      connection.on("resume", console.log)
      connection.on("message", (fullTopic, payload) => {
        const splits = fullTopic.split("/")
        const workspaceId = splits[2]
        invariant(workspaceId, "No workspace ID")
        const topic = splits[3]
        const message = new TextDecoder("utf8").decode(new Uint8Array(payload))
        const parsed = JSON.parse(message)
        if (topic === "poke") {
          bus.emit("poke", { workspaceId })
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
  }, [account, workspaces])

  return null
}
