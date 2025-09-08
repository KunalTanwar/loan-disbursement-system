import { useEffect, useState } from "react"
import { db } from "@/db"
import { Card } from "@/components/ui"
import { formatMoney } from "@/lib/money"
import type { Transaction } from "@/types"

export default function Transactions() {
    const [tx, setTx] = useState<any[]>([])

    useEffect(() => {
        db.transactions.reverse().sortBy("createdAt").then(setTx)
    }, [])
    return (
        <Card title="Transactions">
            <ul className="divide-y text-sm dark:divide-gray-800">
                {tx.map((t: Transaction) => (
                    <li
                        key={t.id}
                        className="flex items-center justify-between py-2"
                    >
                        <div className="capitalize">{t.type}</div>

                        <div className="tabular-nums">
                            {t.type === "disbursement"
                                ? `-${formatMoney(t.amount, t.currency)}`
                                : `+${formatMoney(t.amount, t.currency)}`}
                        </div>

                        <div className="text-xs text-gray-500">
                            {new Date(t.createdAt).toLocaleString()}
                        </div>
                    </li>
                ))}
            </ul>
        </Card>
    )
}
