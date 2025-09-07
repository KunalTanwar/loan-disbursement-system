import { useEffect, useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { db } from "@/db"
import { Card, Select } from "@/components/ui"
import { DisbursementsByMonth } from "@/components/charts/DisbursementsByMonth"
import { formatMoney } from "@/lib/money"

type NormalizedLatest = {
    base: string
    date?: string
    rates: Record<string, number>
}

const CCY_OPTIONS = [
    "USD",
    "INR",
    "EUR",
    "GBP",
    "JPY",
    "AUD",
    "CAD",
    "AED",
    "SGD",
    "CHF",
]

async function fetchLatestNormalized(base: string): Promise<NormalizedLatest> {
    const res = await fetch(
        `https://api.exchangerate.host/latest?base=${encodeURIComponent(base)}`
    )

    if (!res.ok) {
        throw new Error("FX error")
    }

    const json = await res.json()
    const date =
        (typeof json?.date === "string" && json.date) ||
        (typeof json?.timestamp === "number"
            ? new Date(json.timestamp * 1000).toISOString().slice(0, 10)
            : undefined)
    const rates: Record<string, number> =
        json?.rates && typeof json.rates === "object" ? json.rates : {}

    return { base, date, rates }
}

export default function Dashboard() {
    const [reportingCurrency, setReportingCurrency] = useState("USD")

    const [disbursements, setDisbursements] = useState<
        Array<{ createdAt: string; amount: number; currency: string }>
    >([])

    useEffect(() => {
        let active = true

        db.transactions
            .where("type")
            .equals("disbursement")
            .toArray()
            .then((rows) => {
                if (!active) return
                setDisbursements(
                    rows.map((r) => ({
                        createdAt: r.createdAt,
                        amount: r.amount,
                        currency: r.currency,
                    }))
                )
            })

        return () => {
            active = false
        }
    }, [])

    const {
        data: latest,
        isLoading: ratesLoading,
        isError: ratesError,
    } = useQuery<NormalizedLatest>({
        queryKey: ["latest-rates", reportingCurrency],
        queryFn: () => fetchLatestNormalized(reportingCurrency),
        staleTime: 5 * 60 * 1000,
    })

    function toReporting(amount: number, currency: string) {
        if (!latest?.rates || currency === reportingCurrency) {
            return amount
        }

        const r = latest.rates[currency]

        return r ? amount / r : amount
    }

    const totalDisbursedReporting = useMemo(
        () =>
            disbursements.reduce(
                (sum, d) => sum + toReporting(d.amount, d.currency),
                0
            ),
        [disbursements, latest, reportingCurrency]
    )

    const byMonth = useMemo(() => {
        const map = new Map<string, number>()

        for (const d of disbursements) {
            const ym = d.createdAt.slice(0, 7)

            map.set(ym, (map.get(ym) ?? 0) + toReporting(d.amount, d.currency))
        }

        return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b))
    }, [disbursements, latest, reportingCurrency])

    const labels = byMonth.map(([m]) => m)
    const data = byMonth.map(([, v]) => +v.toFixed(2))

    const [activeApps, setActiveApps] = useState(0)
    const [borrowerCount, setBorrowerCount] = useState(0)

    useEffect(() => {
        let mounted = true

        db.applications
            .where("status")
            .anyOf(["submitted", "approved", "disbursed"])
            .count()
            .then((c) => mounted && setActiveApps(c))
        db.borrowers.count().then((c) => mounted && setBorrowerCount(c))

        return () => {
            mounted = false
        }
    }, [])

    const effectiveBase = reportingCurrency
    const effectiveDate = latest?.date ?? new Date().toISOString().slice(0, 10)

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h1 className="text-2xl font-semibold">Portfolio Dashboard</h1>

                <div className="flex items-center gap-2">
                    <label
                        htmlFor="reporting-currency"
                        className="text-sm font-medium text-gray-700 dark:text-gray-300 text-nowrap"
                    >
                        Reporting currency
                    </label>

                    <Select
                        id="reporting-currency"
                        value={reportingCurrency}
                        onChange={(e) => setReportingCurrency(e.target.value)}
                    >
                        {CCY_OPTIONS.map((c) => (
                            <option key={c} value={c}>
                                {c}
                            </option>
                        ))}
                    </Select>
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
                <Card title="Total Disbursed (Reporting)">
                    <div className="text-2xl font-semibold">
                        {formatMoney(
                            totalDisbursedReporting,
                            reportingCurrency
                        )}
                    </div>

                    <div className="mt-1 text-xs text-gray-500">
                        {ratesLoading
                            ? "Loading rates…"
                            : ratesError
                            ? "Rates unavailable"
                            : `Base: ${effectiveBase} • Date: ${effectiveDate}`}
                    </div>
                </Card>

                <Card title="Active Applications">
                    <div className="text-2xl font-semibold">{activeApps}</div>
                </Card>

                <Card title="Borrowers">
                    <div className="text-2xl font-semibold">
                        {borrowerCount}
                    </div>
                </Card>
            </div>

            <DisbursementsByMonth labels={labels} data={data} />
        </div>
    )
}
