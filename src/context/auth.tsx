import React, { createContext, useContext, useEffect, useState } from "react"
import {
    seedAdmin,
    loadSession,
    saveSession,
    clearSession,
    login as doLogin,
    register as doRegister,
} from "@/services/auth"

type Session = {
    id: string
    role: "admin" | "officer" | "auditor" | "customer"
    email: string
    name: string
} | null

const AuthCtx = createContext<{
    user: Session
    login: (email: string, password: string) => Promise<void>
    register: (name: string, email: string, password: string) => Promise<void>
    logout: () => void
}>({
    user: null,
    login: async () => {},
    register: async () => {},
    logout: () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<Session>(null)

    useEffect(() => {
        seedAdmin().catch(() => {}) // ensure admin exists

        setUser(loadSession())
    }, [])

    return (
        <AuthCtx.Provider
            value={{
                user,
                login: async (email, password) => {
                    const u = await doLogin(email, password)
                    saveSession(u)
                    setUser(loadSession())
                },
                register: async (name, email, password) => {
                    const u = await doRegister(name, email, password)
                    saveSession(u)
                    setUser(loadSession())
                },
                logout: () => {
                    clearSession()
                    setUser(null)
                },
            }}
        >
            {children}
        </AuthCtx.Provider>
    )
}

export function useAuth() {
    return useContext(AuthCtx)
}

export function RequireRole({
    role,
    children,
}: {
    role: "admin" | "officer" | "auditor" | "customer"
    children: React.ReactNode
}) {
    const { user } = useAuth()

    if (!user) {
        return <div className="p-4 text-sm text-red-600">Please login.</div>
    }

    if (role === "customer") {
        return <>{children}</>
    }

    return user.role === role ? (
        <>{children}</>
    ) : (
        <div className="p-4 text-sm text-red-600">Access denied.</div>
    )
}
