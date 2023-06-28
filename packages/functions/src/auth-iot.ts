import { assertActor, provideActor } from "@pwa/core/actor.ts"
import { db } from "@pwa/core/drizzle/index.ts"
import { user } from "@pwa/core/user/user.sql.ts"
import { eq } from "drizzle-orm"
import { Config } from "sst/node/config"
import { Session } from "sst/node/future/auth"

export async function handler(evt: any) {
  const tokens = Buffer.from(evt.protocolData.mqtt.password, "base64")
    .toString()
    .split(";")

  const workspaces = [] as string[]

  for (const token of tokens) {
    const session = Session.verify(token)
    provideActor(session as any)
    const account = assertActor("account")
    const rows = await db
      .select({
        workspaceId: user.workspaceId,
      })
      .from(user)
      .where(eq(user.email, account.properties.email))
      .execute()
    workspaces.push(...rows.map((r) => r.workspaceId))
  }

  console.log("🤖 auth-iot: workspaces", workspaces)

  const policy = {
    isAuthenticated: true, //A Boolean that determines whether client can connect.
    principalId: Date.now().toString(), //A string that identifies the connection in logs.
    disconnectAfterInSeconds: 86400,
    refreshAfterInSeconds: 300,
    policyDocuments: [
      {
        Version: "2012-10-17",
        Statement: workspaces.flatMap((workspaceID) => [
          {
            Action: "iot:Connect",
            Effect: "Allow",
            Resource: "*",
          },
          {
            Action: "iot:Receive",
            Effect: "Allow",
            Resource: `arn:aws:iot:${process.env.AWS_REGION}:${process.env.ACCOUNT}:topic/${Config.APP}/${Config.STAGE}/${workspaceID}/*`,
          },
          {
            Action: "iot:Subscribe",
            Effect: "Allow",
            Resource: `arn:aws:iot:${process.env.AWS_REGION}:${process.env.ACCOUNT}:topicfilter/${Config.APP}/${Config.STAGE}/${workspaceID}/*`,
          },
        ]),
      },
    ],
  }

  console.log(JSON.stringify(policy, null, 2))

  return policy
}
