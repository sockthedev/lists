import { Account } from "@pwa/core/account/index.ts"
import { provideActor } from "@pwa/core/actor.ts"
import { User } from "@pwa/core/user/index.ts"
import { useTransaction } from "@pwa/core/util/transaction.ts"
import { Workspace } from "@pwa/core/workspace/index.ts"
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

    let accountId = await Account.fromEmail({ email }).then((x) => x?.id)

    if (!accountId) {
      await useTransaction(async () => {
        const account = await Account.create({
          email: email!,
        })

        accountId = account.id

        const workspace = await Workspace.create({})

        provideActor({
          type: "system",
          properties: {
            workspaceId: workspace.id,
          },
        })

        await User.create({
          email: email!,
          role: "owner",
        })
      })
    }

    invariant(accountId, "Failed to resolve user account")

    return response.session({
      type: "account",
      properties: {
        accountId: accountId!,
        email: email!,
      },
    })
  },
  onError: async () => ({
    statusCode: 401,
  }),
})
