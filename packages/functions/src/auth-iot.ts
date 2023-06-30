import { assertActor, provideActor } from "@lists/core/actor.ts"
import { Config } from "sst/node/config"
import { Session } from "sst/node/future/auth"

export async function handler(evt: any) {
  const token = Buffer.from(evt.protocolData.mqtt.password, "base64").toString()

  const session = Session.verify(token)
  provideActor(session as any)
  const account = assertActor("account")

  const policy = {
    isAuthenticated: true, //A Boolean that determines whether client can connect.
    principalId: Date.now().toString(), //A string that identifies the connection in logs.
    disconnectAfterInSeconds: 86400,
    refreshAfterInSeconds: 300,
    policyDocuments: [
      {
        Version: "2012-10-17",
        Statement: [
          {
            Action: "iot:Connect",
            Effect: "Allow",
            Resource: "*",
          },
          {
            Action: "iot:Receive",
            Effect: "Allow",
            Resource: `arn:aws:iot:${process.env.AWS_REGION}:${process.env.ACCOUNT}:topic/${Config.APP}/${Config.STAGE}/${account.properties.accountId}/*`,
          },
          {
            Action: "iot:Subscribe",
            Effect: "Allow",
            Resource: `arn:aws:iot:${process.env.AWS_REGION}:${process.env.ACCOUNT}:topicfilter/${Config.APP}/${Config.STAGE}/${account.properties.accountId}/*`,
          },
        ],
      },
    ],
  }

  console.log(JSON.stringify(policy, null, 2))

  return policy
}
