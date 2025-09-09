import { useEffect, useMemo, useState } from "react"
import { db } from "../db"
import { Card } from "../components/ui"
import { Link } from "react-router-dom"
import { useAuth } from "../context/auth"
import { formatMoney } from "../lib/money"

export default function MyApplications() {
    const { user } = useAuth()
    const [apps, setApps] = useState<any[]>([])
    const [products, _] = useState<any[]>([])

    useEffect(() => {
        let active: boolean
        ;(async () => {
            const b = await db.borrowers
                .where("userId")
                .equals(user!.id)
                .first()
            if (b) {
                const a = await db.applications
                    .where("borrowerId")
                    .equals(b.id)
                    .toArray()
                setApps(
                    a.sort((x, y) => y.createdAt.localeCompare(x.createdAt))
                )
            } else {
                setApps([])
            }
        })()
        
        return () => {
            active = false
        }
    }, [user?.id])

    const productMap = useMemo(
        () => new Map(products.map((p) => [p.id, p])),
        [products]
    )

    return (
        <div className="space-y-6">
            <Card title="My Applications">
                <div className="mb-3">
                    <Link
                        to="/apply"
                        className="rounded-md bg-blue-600 px-3 py-2 text-white hover:bg-blue-700"
                    >
                        Apply
                    </Link>
                </div>
                <ul className="divide-y dark:divide-gray-800">
                    {apps.map((a) => {
                        const ccy =
                            a.currency ??
                            productMap.get(a.productId)?.currency ??
                            "USD"
                        return (
                            <li
                                key={a.id}
                                className="flex items-center justify-between py-3"
                            >
                                <div>
                                    <div className="font-medium">
                                        {a.id.slice(0, 8)} •{" "}
                                        {formatMoney(a.principal, ccy)}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        Status: {a.status}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Link
                                        className="text-blue-600"
                                        to={`/applications/${a.id}`}
                                    >
                                        Open
                                    </Link>
                                </div>
                            </li>
                        )
                    })}
                    {apps.length === 0 && (
                        <li className="py-3 text-sm text-gray-500">
                            No applications yet.
                        </li>
                    )}
                </ul>
            </Card>
        </div>
    )
}
