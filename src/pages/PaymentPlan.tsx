import { useEffect, useMemo, useState } from "react"
import { db } from "../db"
import { Card } from "../components/ui"
import { useAuth } from "../context/auth"
import { formatMoney } from "../lib/money"
import type { LoanApplication, RepaymentSchedule } from "../types"

type Row = { month: string; principal: number; interest: number; total: number }

export default function PaymentPlan() {
    const { user } = useAuth()
    const [_, setApps] = useState<LoanApplication[]>([])
    const [schedules, setSchedules] = useState<RepaymentSchedule[]>([])
    const [currency, __] = useState("USD")

    useEffect(() => {
        let active = true
        ;(async () => {
            if (!user) {
                if (active) {
                    setApps([])
                    setSchedules([])
                }
                return
            }
            // Resolve the borrower's applications owned by this user
            const borrower = await db.borrowers
                .where("userId")
                .equals(user.id)
                .first()
            if (!borrower) {
                if (active) {
                    setApps([])
                    setSchedules([])
                }
                return
            }

            const myApps = await db.applications
                .where("borrowerId")
                .equals(borrower.id)
                .toArray()
            if (!active) return

            setApps(myApps)

            // Currency: prefer first app currency, else borrower’s currency, then USD
            //   setCurrency(myApps?.?.currency ?? borrower.currency ?? 'USD');

            // Fetch schedules by applicationId using anyOf for correct boolean predicate semantics
            const appIds = myApps.map((a) => a.id)
            const sch = appIds.length
                ? await db.schedules
                      .where("applicationId")
                      .anyOf(appIds)
                      .toArray()
                : []
            if (!active) return
            setSchedules(sch)
        })()
        return () => {
            active = false
        }
    }, [user?.id])

    // Aggregate per month across all schedules
    const rows = useMemo<Row[]>(() => {
        const map = new Map<string, Row>()
        for (const s of schedules) {
            for (const i of s.installments) {
                const ym = i.dueDate.slice(0, 7) // YYYY-MM
                const r = map.get(ym) ?? {
                    month: ym,
                    principal: 0,
                    interest: 0,
                    total: 0,
                }
                r.principal += i.principalDue
                r.interest += i.interestDue
                r.total += i.totalDue
                map.set(ym, r)
            }
        }
        return Array.from(map.values()).sort((a, b) =>
            a.month.localeCompare(b.month)
        )
    }, [schedules])

    const totals = useMemo(() => {
        return rows.reduce(
            (acc, r) => ({
                principal: acc.principal + r.principal,
                interest: acc.interest + r.interest,
                total: acc.total + r.total,
            }),
            { principal: 0, interest: 0, total: 0 }
        )
    }, [rows])

    return (
        <div className="space-y-6">
            <Card title="Monthly Payment Plan">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                        <thead className="border-b dark:border-gray-800">
                            <tr>
                                <th className="px-2 py-2">Month</th>
                                <th className="px-2 py-2">Principal</th>
                                <th className="px-2 py-2">Interest</th>
                                <th className="px-2 py-2">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y dark:divide-gray-800">
                            {rows.map((r) => (
                                <tr key={r.month}>
                                    <td className="px-2 py-2">{r.month}</td>
                                    <td className="px-2 py-2 tabular-nums">
                                        {formatMoney(r.principal, currency)}
                                    </td>
                                    <td className="px-2 py-2 tabular-nums">
                                        {formatMoney(r.interest, currency)}
                                    </td>
                                    <td className="px-2 py-2 tabular-nums font-medium">
                                        {formatMoney(r.total, currency)}
                                    </td>
                                </tr>
                            ))}
                            {rows.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={4}
                                        className="px-2 py-6 text-center text-gray-500"
                                    >
                                        No schedule available yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                        <tfoot className="border-t dark:border-gray-800">
                            <tr>
                                <td className="px-2 py-2 font-medium">
                                    Totals
                                </td>
                                <td className="px-2 py-2 tabular-nums">
                                    {formatMoney(totals.principal, currency)}
                                </td>
                                <td className="px-2 py-2 tabular-nums">
                                    {formatMoney(totals.interest, currency)}
                                </td>
                                <td className="px-2 py-2 tabular-nums font-semibold">
                                    {formatMoney(totals.total, currency)}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </Card>
        </div>
    )
}
