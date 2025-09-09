import { db } from "@/db"
import type { LoanApplication, AuditEvent, Transaction } from "@/types"
import { buildReducingSchedule } from "@/lib/schedule"
import { assertCustomerOwnsBorrower } from "./authorizer"

function assertAdmin(role?: string) {
    if (role !== "admin") throw new Error("Forbidden: admin required")
}

export async function createApplication(
    input: Omit<LoanApplication, "id" | "status" | "createdAt" | "currency">,
    actor?: { id: string; role: string }
) {
    if (actor?.role === "customer") {
        await assertCustomerOwnsBorrower(actor.id, input.borrowerId)
    }

    const product = await db.products.get(input.productId)

    if (!product) throw new Error("Missing product")

    const app: LoanApplication = {
        id: crypto.randomUUID(),
        borrowerId: input.borrowerId,
        productId: input.productId,
        principal: input.principal,
        currency: product.currency,
        status: "draft",
        createdAt: new Date().toISOString(),
        notes: input.notes,
    }

    await db.applications.add(app)

    return app
}

export async function submitApplication(id: string) {
    return db.transaction("rw", db.applications, db.audits, async () => {
        const app = await db.applications.get(id)

        if (!app) {
            throw new Error("Not found")
        }

        if (app.status !== "draft") {
            throw new Error("Invalid state")
        }

        await db.applications.update(id, { status: "submitted" })

        const audit: AuditEvent = {
            id: crypto.randomUUID(),
            actorId: "system",
            action: "submit",
            entity: "LoanApplication",
            entityId: id,
            at: new Date().toISOString(),
        }

        await db.audits.add(audit)

        return true
    })
}

export async function approveApplication(
    id: string,
    approverId: string,
    actor?: { role?: string }
) {
    assertAdmin(actor?.role)
    return db.transaction("rw", [db.applications, db.audits], async () => {
        const app = await db.applications.get(id)
        if (!app) throw new Error("Not found")
        if (app.status !== "submitted")
            throw new Error("Invalid state: not submitted")

        const approvedAt = new Date().toISOString()
        await db.applications.update(id, {
            status: "approved",
            approvedAt,
            approverId,
        })

        const audit: AuditEvent = {
            id: crypto.randomUUID(),
            actorId: approverId,
            action: "approve",
            entity: "LoanApplication",
            entityId: id,
            at: approvedAt,
        }
        await db.audits.add(audit)
        return true
    })
}

export async function disburseApplication(
    id: string,
    payoutAccount: string,
    payoutCurrency: string,
    actor?: { id: string; role?: string }
) {
    assertAdmin(actor?.role)
    return db.transaction(
        "rw",
        [
            db.applications,
            db.transactions,
            db.schedules,
            db.audits,
            db.products,
        ],
        async () => {
            const app = await db.applications.get(id)
            if (!app) throw new Error("Not found")
            if (app.status !== "approved")
                throw new Error("Invalid state: not approved")

            const product = await db.products.get(app.productId)
            if (!product) throw new Error("Missing product")

            const disbursedAt = new Date().toISOString()

            // record disbursement in payoutCurrency; app.principal is in app.currency
            await db.applications.update(id, {
                status: "disbursed",
                disbursedAt,
            })

            const tx: Transaction = {
                id: crypto.randomUUID(),
                type: "disbursement",
                amount: app.principal, // store principal; convert at display/reporting time
                currency: payoutCurrency,
                createdAt: disbursedAt,
                applicationId: id,
                borrowerId: app.borrowerId,
                meta: { account: payoutAccount, appCurrency: app.currency },
            }
            await db.transactions.add(tx)

            const installments = buildReducingSchedule(
                new Date(disbursedAt),
                app.principal,
                product.interestRate,
                product.termMonths
            )
            await db.schedules.add({
                id: crypto.randomUUID(),
                applicationId: id,
                installments,
            })

            const audit: AuditEvent = {
                id: crypto.randomUUID(),
                actorId: actor!.id,
                action: "disburse",
                entity: "LoanApplication",
                entityId: id,
                at: disbursedAt,
            }
            await db.audits.add(audit)
            return true
        }
    )
}
