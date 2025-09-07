import { db } from "@/db"
import { convertAmount } from "./fx"

export async function postRepayment(
    applicationId: string,
    installmentId: string,
    amountIn: number,
    payCurrency: string
) {
    return db.transaction(
        "rw",
        db.repayments,
        db.transactions,
        db.schedules,
        db.applications,
        async () => {
            const app = await db.applications.get(applicationId)
            if (!app) throw new Error("Missing app")
            const receivedAt = new Date().toISOString()

            let applied = amountIn
            let fx:
                | { from: string; to: string; rate: number; date?: string }
                | undefined
            if (payCurrency !== app.currency) {
                const { result, rate } = await convertAmount(
                    amountIn,
                    payCurrency,
                    app.currency,
                    receivedAt.slice(0, 10)
                )
                applied = result
                fx = {
                    from: payCurrency,
                    to: app.currency,
                    rate,
                    date: receivedAt.slice(0, 10),
                }
            }

            // Mark installment paid if applied covers it (simple example)
            const schedule = await db.schedules
                .where("applicationId")
                .equals(applicationId)
                .first()
            if (schedule) {
                const inst = schedule.installments.find(
                    (i) => i.id === installmentId
                )
                if (inst && applied + 1e-6 >= inst.totalDue) {
                    inst.paid = true
                    inst.paidAt = receivedAt
                }
                await db.schedules.update(schedule.id, {
                    installments: schedule.installments,
                })
            }

            await db.repayments.add({
                id: crypto.randomUUID(),
                applicationId,
                installmentId,
                amount: amountIn, // original paid amount
                currency: payCurrency,
                receivedAt,
            })

            await db.transactions.add({
                id: crypto.randomUUID(),
                type: "repayment",
                amount: amountIn,
                currency: payCurrency,
                createdAt: receivedAt,
                applicationId,
                meta: {
                    installmentId,
                    fx,
                    appliedInAppCurrency: +applied.toFixed(2),
                    appCurrency: app.currency,
                },
            })
            return true
        }
    )
}
