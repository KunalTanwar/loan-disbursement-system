import { useEffect, useState } from "react"
import { db } from "@/db"
import { Card } from "@/components/ui"

export default function ProductsCatalog() {
    const [items, setItems] = useState<any[]>([])
    useEffect(() => {
        db.products.orderBy("name").toArray().then(setItems)
    }, [])
    return (
        <Card title="Available Products">
            <ul className="divide-y dark:divide-gray-800">
                {items.map((p) => (
                    <li key={p.id} className="py-2">
                        <div className="font-medium">{p.name}</div>
                        <div className="text-xs text-gray-500">
                            {p.currency} • {p.interestRate}% {p.interestType} •{" "}
                            {p.termMonths}m
                        </div>
                    </li>
                ))}
                {items.length === 0 && (
                    <li className="py-2 text-sm text-gray-500">
                        No products published yet.
                    </li>
                )}
            </ul>
        </Card>
    )
}
