import { assertActor, provideActor, useActor } from "@lists/core/actor.ts"
import { User } from "@lists/core/user/index.ts"
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

  const listId = useHeader("x-list-id")
  if (listId) {
    console.log("auth list", listId)
    const account = assertActor("account")
    provideActor({
      type: "system",
      properties: {
        listId,
      },
    })
    const user = await User.fromEmail({ email: account.properties.email })
    invariant(
      user,
      `User not found for email ${account.properties.email} in list ${listId}`,
    )

    console.log("using user actor", user.id)
    provideActor({
      type: "user",
      properties: {
        listId,
        userId: user.id,
      },
    })
  }
}
