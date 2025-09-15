import React, { useEffect, useMemo, useState } from "react"
import { BellIcon } from "@heroicons/react/24/outline"
import { db } from "@/db"
import { useAuth } from "@/context/auth"

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
                <h3 className="text-2xl mb-2 font-medium text-gray-700 dark:text-gray-300">
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
            className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded bg-blue-600 px-3 py-2 text-white hover:bg-blue-700 disabled:opacity-50 ${
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
            className={`w-full rounded border px-3 py-2 dark:border-gray-800 dark:bg-gray-950 ${
                props.className ?? ""
            }`}
        />
    )
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
    return (
        <select
            {...props}
            className={`w-full cursor-pointer rounded appearance-none border px-3 py-2 dark:border-gray-800 dark:bg-gray-950 ${
                props.className ?? ""
            }`}
        />
    )
}

type NoticeKind = "approval" | "rejection" | "due" | "failed" | "overdue"
type Notice = {
    id: string
    kind: NoticeKind
    message: string
    at: string
    appId?: string
}

export default function NotificationBell() {
    const { user } = useAuth()
    const [open, setOpen] = useState(false)
    const [items, setItems] = useState<Notice[]>([])
    const seenKey = user ? `notices_last_seen_${user.id}` : ""
    const lastSeen = user ? Number(localStorage.getItem(seenKey) || 0) : 0

    // Load only current user's related notifications
    useEffect(() => {
        if (!user) {
            setItems([])
            return
        }
        let active = true
        ;(async () => {
            // Find borrower owned by this user
            const borrower = await db.borrowers
                .where("userId")
                .equals(user.id)
                .first()
            if (!borrower) {
                if (active) setItems([])
                return
            }

            // Gather application IDs for this borrower
            const apps = await db.applications
                .where("borrowerId")
                .equals(borrower.id)
                .toArray()
            const appIds = new Set(apps.map((a) => a.id))

            // Build notices from audits (approve/reject)
            const audits = await db.audits
                .filter(
                    (a) =>
                        a.entity === "LoanApplication" && appIds.has(a.entityId)
                )
                .toArray()

            const notices: Notice[] = []
            for (const a of audits) {
                if (a.action === "approve") {
                    notices.push({
                        id: a.id,
                        kind: "approval",
                        message: `Loan approved (${a.entityId.slice(0, 8)})`,
                        at: a.at,
                        appId: a.entityId,
                    })
                } else if (a.action === "reject") {
                    const reason =
                        typeof a.diff?.reason === "string"
                            ? a.diff!.reason
                            : "No reason"
                    notices.push({
                        id: a.id,
                        kind: "rejection",
                        message: `Loan rejected (${a.entityId.slice(
                            0,
                            8
                        )}): ${reason}`,
                        at: a.at,
                        appId: a.entityId,
                    })
                }
            }

            // Due soon / overdue from schedules
            const schedules = await db.schedules
                .filter((s) => appIds.has(s.applicationId))
                .toArray()

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
                            appId: s.applicationId,
                        })
                    } else if (due <= near) {
                        notices.push({
                            id: inst.id,
                            kind: "due",
                            message: `Installment due soon (${due.toDateString()})`,
                            at: inst.dueDate,
                            appId: s.applicationId,
                        })
                    }
                }
            }

            // Payment failed stub: invalid repayments
            const repayments = await db.repayments
                .filter((r) => appIds.has(r.applicationId))
                .toArray()

            for (const r of repayments) {
                if (r.amount <= 0) {
                    notices.push({
                        id: r.id,
                        kind: "failed",
                        message: `Payment failed for ${r.applicationId.slice(
                            0,
                            8
                        )}`,
                        at: r.receivedAt,
                        appId: r.applicationId,
                    })
                }
            }

            notices.sort((a, b) => a.at.localeCompare(b.at)).reverse()

            if (active) setItems(notices)
        })()

        return () => {
            active = false
        }
    }, [user?.id])

    // Sync across tabs/windows
    useEffect(() => {
        if (!user) return
        const onStorage = (e: StorageEvent) => {
            if (e.key === `notices_last_seen_${user.id}`) {
                // forces re-render by toggling open state twice if open, or set state no-op
                // simpler: just trigger a state update by reading current items (no change)
                setItems((prev) => [...prev])
            }
        }

        window.addEventListener("storage", onStorage)

        return () => window.removeEventListener("storage", onStorage)
    }, [user?.id])

    const unseen = useMemo(
        () => items.filter((n) => new Date(n.at).getTime() > lastSeen),

        [items, lastSeen]
    )
    const count = unseen.length

    function markAllAsRead() {
        if (!user) return

        localStorage.setItem(seenKey, String(Date.now()))

        // trigger storage event for this tab (for immediate visual update)
        window.dispatchEvent(
            new StorageEvent("storage", {
                key: seenKey,
                newValue: String(Date.now()),
            })
        )
    }

    function toggleOpen() {
        if (!user) return

        const next = !open

        setOpen(next)

        if (next) {
            // first open => mark seen
            markAllAsRead()
        }
    }

    if (!user) return null

    return (
        <div className="relative">
            <button
                aria-label="Notifications"
                className="relative cursor-pointer rounded-md p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={toggleOpen}
            >
                <BellIcon className="size-6" />

                {count > 0 && (
                    <span className="absolute -right-1 -top-1 inline-flex size-5 items-center justify-center rounded-full bg-red-600 text-xs text-white">
                        {count}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 z-30 mt-2 w-96 rounded-lg border bg-white p-2 shadow-lg dark:border-gray-800 dark:bg-gray-900">
                    <div className="mb-2 flex items-center justify-between">
                        <div className="text-sm font-medium">Notifications</div>
                        <button
                            className="text-xs text-blue-600 hover:underline"
                            onClick={markAllAsRead}
                        >
                            Mark all as read
                        </button>
                    </div>
                    <ul className="max-h-96 divide-y overflow-auto text-sm dark:divide-gray-800">
                        {items.length === 0 && (
                            <li className="p-3 text-gray-500">
                                No notifications
                            </li>
                        )}

                        {items.map((n) => (
                            <li key={n.id} className="p-3">
                                <div className="flex items-center justify-between">
                                    <span className="font-medium capitalize">
                                        {n.kind}
                                    </span>
                                    {new Date(n.at).getTime() > lastSeen && (
                                        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-800 dark:bg-blue-900/40 dark:text-blue-200">
                                            New
                                        </span>
                                    )}
                                </div>
                                <div className="mt-0.5 text-xs text-gray-500">
                                    {n.message}
                                </div>
                                <div className="mt-0.5 text-[10px] text-gray-400">
                                    {new Date(n.at).toLocaleString()}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    )
}
