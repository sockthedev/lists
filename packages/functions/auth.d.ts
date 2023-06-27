import "sst/node/future/auth"

declare module "sst/node/future/auth" {
  export interface SessionTypes {
    account: {
      accountId: string
      email: string
    }
  }
}
