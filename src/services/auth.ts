import { db } from "../db"
import type { User } from "../types"
import { hashPassword, verifyPassword } from "../lib/crypto"

const ADMIN_EMAIL = "admin@email.com"
const ADMIN_PASS = "admin"

export async function seedAdmin() {
    const existing = await db.users.where("email").equals(ADMIN_EMAIL).first()

    if (existing) {
        return existing
    }

    const pwd = await hashPassword(ADMIN_PASS)

    const admin: User = {
        id: crypto.randomUUID(),
        name: "Administrator",
        email: ADMIN_EMAIL,
        role: "admin",
        password: pwd,
    }

    await db.users.add(admin)

    return admin
}

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateRegisterClient(
    name: string,
    email: string,
    password: string
) {
    const errors: Record<string, string> = {}

    if (!name.trim()) {
        errors.name = "Name is required"
    }

    if (!emailRe.test(email)) {
        errors.email = "Invalid email"
    }

    if (password.length < 8) {
        errors.password = "Min 8 chars"
    }

    if (
        !/[A-Z]/.test(password) ||
        !/[a-z]/.test(password) ||
        !/[0-9]/.test(password)
    ) {
        errors.password =
            (errors.password ? errors.password + "; " : "") +
            "Use upper, lower and digit"
    }

    return errors
}

export async function register(name: string, email: string, password: string) {
    if (!name.trim()) {
        throw new Error("Name is required")
    }

    if (!emailRe.test(email)) {
        throw new Error("Invalid email")
    }

    if (password.length < 8) {
        throw new Error("Weak password")
    }

    const exists = await db.users.where("email").equals(email).first()

    if (exists) {
        throw new Error("Email already registered")
    }

    const pwd = await hashPassword(password)

    const user: User = {
        id: crypto.randomUUID(),
        name,
        email,
        role: "customer",
        password: pwd,
    }

    await db.users.add(user)

    return user
}

export async function login(email: string, password: string) {
    const user = await db.users.where("email").equals(email).first()

    if (!user || !user.password) {
        throw new Error("Invalid credentials")
    }

    const ok = await verifyPassword(password, user.password)

    if (!ok) {
        throw new Error("Invalid credentials")
    }

    return user
}

export type Session = {
    id: string
    role: "admin" | "officer" | "auditor" | "customer"
    email: string
    name: string
}
const SESSION_KEY = "session_user"

function safeGetItem(key: string): string | null {
    try {
        return typeof window !== "undefined" ? localStorage.getItem(key) : null
    } catch {
        return null
    }
}

function safeSetItem(key: string, value: string) {
    try {
        if (typeof window !== "undefined") localStorage.setItem(key, value)
    } catch {
        /* ignore */
    }
}

function safeRemoveItem(key: string) {
    try {
        if (typeof window !== "undefined") localStorage.removeItem(key)
    } catch {
        /* ignore */
    }
}

function isValidSession(x: any): x is Session {
    return (
        x &&
        typeof x.id === "string" &&
        typeof x.email === "string" &&
        typeof x.name === "string" &&
        (x.role === "admin" ||
            x.role === "officer" ||
            x.role === "auditor" ||
            x.role === "customer")
    )
}

export function saveSession(u: {
    id: string
    role: Session["role"]
    email: string
    name: string
}) {
    const minimal: Session = {
        id: u.id,
        role: u.role,
        email: u.email,
        name: u.name,
    }
    safeSetItem(SESSION_KEY, JSON.stringify(minimal))
}

export function loadSession(): Session | null {
    const raw = safeGetItem(SESSION_KEY)
    if (!raw) return null
    try {
        const parsed = JSON.parse(raw)
        if (!isValidSession(parsed)) {
            safeRemoveItem(SESSION_KEY)
            return null
        }
        return parsed
    } catch {
        // corrupted JSON — clear and return null
        safeRemoveItem(SESSION_KEY)
        return null
    }
}

export function clearSession() {
    safeRemoveItem(SESSION_KEY)
}
