import React from "react"
import { useNavigate } from "react-router-dom"

import { useAccount } from "@/context/auth"

export function LoginCallback() {
  const account = useAccount()
  const navigate = useNavigate()

  React.useEffect(() => {
    if (account) {
      console.log("🤖 LoginCallback: account resolved")
      navigate("/user")
    } else {
      console.log("🤖 LoginCallback: no account resolved, yet")
    }
  }, [account, navigate])

  return <div>Logging you in...</div>
}
