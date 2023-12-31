import React from "react"
import invariant from "tiny-invariant"

export type Account = {
  [x: string]: unknown
  accountId: string
  email: string
  token: string
}

type AuthContextType = {
  account: Account | null
  loginUrls: {
    email: () => string
    google: () => string
    twitter: () => string
  }
  logout: () => void
}

function decodeToken(input: { token: string }): Account {
  const [, payloadEncoded] = input.token.split(".")
  invariant(payloadEncoded, "Invalid access token")
  const payload = JSON.parse(
    atob(payloadEncoded.replace(/-/g, "+").replace(/_/g, "/")),
  )
  return {
    ...payload.properties,
    token: input.token,
  }
}

function loginUrl(input: { provider: "google" | "email" }) {
  if (input.provider === "email") {
    throw new Error("Not implemented")
  }
  const params = new URLSearchParams({
    client_id: "web",
    redirect_uri: location.origin + "/auth/callback",
    response_type: "token",
    provider: input.provider,
  })
  const url = import.meta.env.VITE_AUTH_URL + "/authorize?" + params.toString()
  return url
}

const loginUrls = {
  email: () => loginUrl({ provider: "email" }),
  google: () => loginUrl({ provider: "google" }),
  twitter: () => loginUrl({ provider: "google" }),
}

const store = {
  get() {
    const raw = localStorage.getItem("account")
    if (!raw) return null
    return JSON.parse(raw) as Account
  },
  set(input: { account: Account }) {
    return localStorage.setItem("account", JSON.stringify(input.account))
  },
  remove() {
    return localStorage.removeItem("account")
  },
}

function logout() {
  store.remove()
  location.href = location.origin
}

const AuthContext = React.createContext<AuthContextType>(null as any)

export type AuthProviderProps = {
  children: React.ReactNode
}

export function AuthProvider(props: AuthProviderProps) {
  const account = React.useMemo<Account | null>(() => {
    const fragment = new URLSearchParams(location.hash.substring(1))
    const access_token = fragment.get("access_token")
    if (access_token) {
      // Handling an auth callback, this should become the authoritative account
      const _account = decodeToken({ token: access_token })
      console.log(
        "🤖 Auth registering account from callback",
        JSON.stringify(_account, null, 2),
      )
      store.set({ account: _account })
      return _account
    }
    return store.get()
  }, [])

  return (
    <AuthContext.Provider
      value={{
        account,
        loginUrls,
        logout,
      }}
    >
      {props.children}
    </AuthContext.Provider>
  )
}

function useAuth() {
  const result = React.useContext(AuthContext)
  if (!result) throw new Error("useAuth must be used within an AuthProvider")
  return result
}

export function useAccount() {
  return useAuth().account
}

export function useLogout() {
  return useAuth().logout
}

export function useLoginUrls() {
  return useAuth().loginUrls
}
