import React from "react"
import { useNavigate } from "react-router-dom"

import { useAccount } from "@/context/auth"
import { log } from "@/lib/log"

const clog = log.context("LoginCallback")

export function LoginCallback() {
  const account = useAccount()
  const navigate = useNavigate()

  React.useEffect(() => {
    if (account) {
      clog.debug("account resolved")
      navigate("/user")
    } else {
      clog.debug("no account resolved, yet")
    }
  }, [account, navigate])

  return <div>Logging you in...</div>
}
