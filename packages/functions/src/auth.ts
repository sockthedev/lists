import { Account } from "@lists/core/account/index.ts"
import { provideActor } from "@lists/core/actor.ts"
import { useTransaction } from "@lists/core/util/transaction.ts"
import { Config } from "sst/node/config"
import { AuthHandler, GoogleAdapter } from "sst/node/future/auth"
import invariant from "tiny-invariant"

export const handler = AuthHandler({
  providers: {
    google: GoogleAdapter({
      mode: "oidc",
      clientID: (Config as any).GOOGLE_CLIENT_ID,
    }),
  },
  async clients() {
    return {
      web: "",
    }
  },
  onSuccess: async (input, response) => {
    let email: string | undefined

    if (input.provider === "google") {
      email = input.tokenset.claims().email
    }
    invariant(email != null, 'Expected "email" to be defined')

    provideActor({
      type: "system",
      properties: {},
    })

    let accountId = await Account.fromEmail({ email }).then((x) => x?.id)

    if (!accountId) {
      await useTransaction(async () => {
        const account = await Account.create({
          email: email!,
        })

        accountId = account.id
      })
    }

    invariant(accountId, "Failed to resolve user account")

    return response.session({
      type: "account",
      properties: {
        accountId,
      },
    })
  },
  onError: async () => ({
    statusCode: 401,
  }),
})
