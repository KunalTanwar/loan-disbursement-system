import { useEffect, useState } from "react"
import { db } from "../db"
import { Card } from "../components/ui"

function relativeTimeFromNow(d: Date) {
    const diff = Date.now() - d.getTime()
    const sec = Math.round(diff / 1000)
    const min = Math.round(sec / 60)
    const hour = Math.round(min / 60)
    const day = Math.round(hour / 24)

    if (sec < 45) {
        return `${sec}s ago`
    }

    if (min < 45) {
        return `${min}m ago`
    }

    if (hour < 36) {
        return `${hour}h ago`
    }

    return `${day}d ago`
}

export default function AuditLog() {
    const [items, setItems] = useState<any[]>([])

    useEffect(() => {
        db.audits.reverse().sortBy("at").then(setItems)
    }, [])

    return (
        <Card title="Audit Log">
            <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                    <thead className="border-b dark:border-gray-800">
                        <tr>
                            <th scope="col" className="px-2 py-2">
                                Event
                            </th>

                            <th scope="col" className="px-2 py-2">
                                Actor
                            </th>

                            <th scope="col" className="px-2 py-2">
                                When
                            </th>
                        </tr>
                    </thead>

                    <tbody className="divide-y dark:divide-gray-800">
                        {items.map((a) => {
                            const d = new Date(a.at)
                            const isSystem = a.actorId === "system"

                            return (
                                <tr key={a.id}>
                                    <td className="px-2 py-2">
                                        <span className="font-medium">
                                            {a.action}
                                        </span>{" "}
                                        {a.entity}
                                    </td>

                                    <td className="px-2 py-2">
                                        {isSystem ? (
                                            <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-800 dark:text-gray-100">
                                                System
                                            </span>
                                        ) : (
                                            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/40 dark:text-blue-200">
                                                User: {a.actorId}
                                            </span>
                                        )}
                                    </td>

                                    <td className="px-2 py-2">
                                        <time
                                            dateTime={a.at}
                                            title={`${d.toLocaleString()} • local time`}
                                            className="tabular-nums"
                                        >
                                            {relativeTimeFromNow(d)}
                                        </time>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </Card>
    )
}
