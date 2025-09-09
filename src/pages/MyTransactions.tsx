import { useEffect, useState } from "react"
import { db } from "../db"
import { Card } from "../components/ui"
import { useAuth } from "../context/auth"
import { formatMoney } from "../lib/money"

export default function MyTransactions() {
    const { user } = useAuth()
    const [rows, setRows] = useState<any[]>([])
    useEffect(() => {
        let active = true
        ;(async () => {
            const b = await db.borrowers
                .where("userId")
                .equals(user!.id)
                .first()
            if (!b) {
                setRows([])
                return
            }
            const tx = await db.transactions
                .where("borrowerId")
                .equals(b.id)
                .reverse()
                .sortBy("createdAt")
            if (active) setRows(tx)
        })()
        return () => {
            active = false
        }
    }, [user?.id])

    return (
        <Card title="My Transactions">
            <ul className="divide-y text-sm dark:divide-gray-800">
                {rows.map((t) => (
                    <li
                        key={t.id}
                        className="flex items-center justify-between py-2"
                    >
                        <div className="capitalize">{t.type}</div>

                        <div className="tabular-nums">
                            {t.type === "disbursement"
                                ? `+ ${formatMoney(t.amount, t.currency)}`
                                : `- ${formatMoney(t.amount, t.currency)}`}
                        </div>

                        <div className="text-xs text-gray-500">
                            {new Date(t.createdAt).toLocaleString()}
                        </div>
                    </li>
                ))}
                {rows.length === 0 && (
                    <li className="py-2 text-gray-500">No transactions.</li>
                )}
            </ul>
        </Card>
    )
}
