import React from "react"

import { useAuth } from "@/context/auth.tsx"

export function LoginCallback() {
  const { account } = useAuth()

  React.useEffect(() => {
    if (account) {
      console.log("🤖 LoginCallback: account resolved")
    } else {
      console.log("🤖 LoginCallback: no account resolved, yet")
    }
  }, [account])

  return <div>Logging you in...</div>
}
