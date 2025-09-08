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

// naive session using localStorage
export function saveSession(u: User) {
    localStorage.setItem(
        "session_user",
        JSON.stringify({ id: u.id, role: u.role, email: u.email, name: u.name })
    )
}
export function loadSession(): {
    id: string
    role: string
    email: string
    name: string
} | null {
    const s = localStorage.getItem("session_user")

    return s ? JSON.parse(s) : null
}
export function clearSession() {
    localStorage.removeItem("session_user")
}
