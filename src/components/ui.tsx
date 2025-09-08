import React, { useEffect, useState } from "react"
import { BellIcon } from "@heroicons/react/24/outline"
import { db } from "../db"

export function Card(
    props: React.PropsWithChildren<{ title?: string; className?: string }>
) {
    return (
        <div
            className={`rounded-lg border bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 ${
                props.className ?? ""
            }`}
        >
            {props.title && (
                <h3 className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                    {props.title}
                </h3>
            )}
            {props.children}
        </div>
    )
}

export function Button(
    props: React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }
) {
    const { loading, className, ...rest } = props
    return (
        <button
            {...rest}
            className={`inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-white hover:bg-blue-700 disabled:opacity-50 ${
                className ?? ""
            }`}
            aria-busy={loading ? "true" : undefined}
            disabled={loading || props.disabled}
        >
            {loading && (
                <span className="inline-block size-4 animate-spin rounded-full border-2 border-white/60 border-t-transparent" />
            )}
            {props.children}
        </button>
    )
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
    return (
        <input
            {...props}
            className={`w-full rounded-md border px-3 py-2 dark:border-gray-800 dark:bg-gray-950 ${
                props.className ?? ""
            }`}
        />
    )
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
    return (
        <select
            {...props}
            className={`w-full rounded-md border px-3 py-2 dark:border-gray-800 dark:bg-gray-950 ${
                props.className ?? ""
            }`}
        />
    )
}

type Notice = {
    id: string
    kind: "approval" | "rejection" | "due" | "failed" | "overdue"
    message: string
    at: string
}

export default function NotificationBell() {
    const [open, setOpen] = useState(false)
    const [items, setItems] = useState<Notice[]>([])

    useEffect(() => {
        let active = true
        ;(async () => {
            const apps = await db.applications.toArray()
            const audits = await db.audits.toArray()
            const schedules = await db.schedules.toArray()
            const notices: Notice[] = []

            // approvals / rejections
            for (const a of audits) {
                if (a.action === "approve" && a.entity === "LoanApplication")
                    notices.push({
                        id: a.id,
                        kind: "approval",
                        message: `Loan approved (${a.entityId})`,
                        at: a.at,
                    })
                if (a.action === "reject" && a.entity === "LoanApplication")
                    notices.push({
                        id: a.id,
                        kind: "rejection",
                        message: `Loan rejected (${a.entityId})`,
                        at: a.at,
                    })
            }

            // due within 7 days / overdue
            const now = new Date()
            const near = new Date()
            near.setDate(near.getDate() + 7)
            for (const s of schedules) {
                for (const inst of s.installments) {
                    if (inst.paid) continue
                    const due = new Date(inst.dueDate)
                    if (due <= now) {
                        notices.push({
                            id: inst.id,
                            kind: "overdue",
                            message: `Installment overdue (${due.toDateString()})`,
                            at: inst.dueDate,
                        })
                    } else if (due <= near) {
                        notices.push({
                            id: inst.id,
                            kind: "due",
                            message: `Installment due soon (${due.toDateString()})`,
                            at: inst.dueDate,
                        })
                    }
                }
            }

            // payment failed stub: detect zero/negative repayment entries if any
            const repayments = await db.repayments.toArray()
            for (const r of repayments) {
                if (r.amount <= 0)
                    notices.push({
                        id: r.id,
                        kind: "failed",
                        message: `Payment failed/invalid for ${r.applicationId}`,
                        at: r.receivedAt,
                    })
            }

            if (active)
                setItems(
                    notices.sort((a, b) => a.at.localeCompare(b.at)).reverse()
                )
        })()
        return () => {
            active = false
        }
    }, [])

    const count = items.length

    return (
        <div className="relative">
            <button
                aria-label="Notifications"
                className="relative rounded-md p-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                onClick={() => setOpen((v) => !v)}
            >
                <BellIcon className="size-6" />
                {count > 0 && (
                    <span className="absolute -right-1 -top-1 inline-flex size-5 items-center justify-center rounded-full bg-red-600 text-xs text-white">
                        {count}
                    </span>
                )}
            </button>
            {open && (
                <div className="absolute right-0 z-20 mt-2 w-80 rounded-lg border bg-white p-2 shadow-lg dark:border-gray-800 dark:bg-gray-900">
                    <div className="text-sm font-medium border-b pb-2 dark:border-b-gray-800">
                        Notifications
                    </div>

                    <ul className="max-h-80 divide-y overflow-auto text-sm dark:divide-gray-800">
                        {items.length === 0 && (
                            <li className="p-3 text-gray-500">
                                No notifications
                            </li>
                        )}
                        {items.map((n) => (
                            <li key={n.id} className="p-3 pt-2">
                                <div className="font-medium capitalize">
                                    {n.kind}
                                </div>
                                <div className="text-xs text-gray-500">
                                    {n.message}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    )
}
