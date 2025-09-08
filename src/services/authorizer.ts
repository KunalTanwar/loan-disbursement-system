import { db } from "../db"

export async function assertCustomerOwnsApplication(
    userId: string,
    appId: string
) {
    const app = await db.applications.get(appId)
    if (!app) throw new Error("Not found")
    const borrower = await db.borrowers.get(app.borrowerId)
    if (!borrower || borrower.userId !== userId) throw new Error("Forbidden")
    return { app, borrower }
}

export async function assertCustomerOwnsBorrower(
    userId: string,
    borrowerId: string
) {
    const b = await db.borrowers.get(borrowerId)
    if (!b || b.userId !== userId) throw new Error("Forbidden")
    return b
}

export function assertAdmin(role: string | undefined) {
    if (role !== "admin") throw new Error("Forbidden")
}
