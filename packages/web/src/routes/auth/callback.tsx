import React from "react"
import { useNavigate } from "react-router-dom"

import { useAuth } from "@/context/auth.tsx"

export function LoginCallback() {
  const { account } = useAuth()
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
