import { assertActor, provideActor, useActor } from "@pwa/core/actor.ts"
import { User } from "@pwa/core/user/index.ts"
import { useHeader } from "sst/node/api"
import { useSession } from "sst/node/future/auth"
import invariant from "tiny-invariant"

export async function useApiAuth() {
  try {
    useActor()
  } catch {
    const session = useSession()
    provideActor(session)
  }

  const workspaceId = useHeader("x-pwa-workspace")
  if (workspaceId) {
    console.log("auth workspace", workspaceId)
    const account = assertActor("account")
    provideActor({
      type: "system",
      properties: {
        workspaceId,
      },
    })
    const user = await User.fromEmail({ email: account.properties.email })
    invariant(
      user,
      `User not found for email ${account.properties.email} in workspace ${workspaceId}`,
    )

    console.log("using user actor", user.id)
    provideActor({
      type: "user",
      properties: {
        workspaceId,
        userId: user.id,
      },
    })
  }
}
