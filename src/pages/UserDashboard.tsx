import { useEffect, useMemo, useState } from "react"
import { db } from "@/db"
import { Card } from "@/components/ui"
import { formatMoney } from "@/lib/money"
import { Doughnut } from "react-chartjs-2"
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js"
import type { LoanApplication } from "@/types"
ChartJS.register(ArcElement, Tooltip, Legend)

export default function UserDashboard() {
    const [_, setAppIds] = useState<string[]>([])
    const [apps, setApps] = useState<LoanApplication[]>([])
    const [schedules, setSchedules] = useState<any[]>([])
    const [currency, __] = useState("INR")

    useEffect(() => {
        let active = true
        ;(async () => {
            const a = await db.applications.toArray()
            const s = await db.schedules.toArray()

            if (!active) {
                return
            }

            setApps(a)
            setSchedules(s)
            setAppIds(a.map((x) => x.id))
            // setCurrency(a?.find((x) => x.currency ?? "USD"))
        })()
        return () => {
            active = false
        }
    }, [])

    const totals = useMemo(() => {
        let principal = 0
        let interest = 0

        for (const a of apps) principal += a.principal

        for (const s of schedules)
            for (const i of s.installments) interest += i.interestDue

        return { principal, interest, total: principal + interest }
    }, [apps, schedules])

    const emiExample = useMemo(() => {
        // Average EMI across disbursed apps with schedules
        const emisc: number[] = []

        for (const s of schedules)
            for (const i of s.installments) emisc.push(i.totalDue)

        const avg = emisc.length
            ? emisc.reduce((a, b) => a + b, 0) / emisc.length
            : 0

        return avg
    }, [schedules])

    const data = {
        labels: ["Principal", "Interest"],
        datasets: [
            {
                data: [totals.principal, totals.interest],
                backgroundColor: ["#3b82f6", "#f59e0b"],
            },
        ],
    }

    return (
        <div className="grid gap-6 sm:grid-cols-2">
            <Card title="EMI and Totals">
                <div className="space-y-4 mt-4">
                    <div>
                        <p className="text-2xl font-semibold text-gray-400">
                            Average EMI
                        </p>
                        <span className="text-lg font-light text-gray-200">
                            {formatMoney(emiExample, currency)}
                        </span>
                    </div>

                    <div>
                        <p className="text-2xl font-semibold text-gray-400">
                            Total Principal
                        </p>
                        <span className="text-lg font-light text-gray-200">
                            {formatMoney(totals.principal, currency)}
                        </span>
                    </div>

                    <div>
                        <p className="text-2xl font-semibold text-gray-400">
                            Total Interest
                        </p>
                        <span className="text-lg font-light text-gray-200">
                            {formatMoney(totals.interest, currency)}
                        </span>
                    </div>

                    <div>
                        <p className="text-2xl font-semibold text-gray-400">
                            Grand Total
                        </p>
                        <span className="text-lg font-light text-gray-200">
                            {formatMoney(totals.total, currency)}
                        </span>
                    </div>
                </div>
            </Card>

            <Card title="Cost Breakdown">
                <Doughnut data={data} />
            </Card>
        </div>
    )
}
