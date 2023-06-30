import { Account } from "@lists/core/account/index.ts"
import { provideActor } from "@lists/core/actor.ts"
import { useSession } from "sst/node/future/auth"
import invariant from "tiny-invariant"

export async function useApiAuth() {
  const session = useSession()
  provideActor(session)

  if (session.type === "account") {
    // TODO: Could do more hardcore checks, like if the account was disabled etc
    const account = await Account.fromId({ id: session.properties.accountId })
    invariant(account, `Account not found`)
  }
}
