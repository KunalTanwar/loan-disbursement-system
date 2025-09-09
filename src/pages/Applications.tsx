// src/pages/Applications.tsx
import { useEffect, useMemo, useState } from "react"
import { db } from "../db"
import {
    createApplication,
    submitApplication,
    approveApplication,
} from "../services/applications"
import { Card, Button, Input, Select } from "../components/ui"
import { Link } from "react-router-dom"
import { formatMoney } from "../lib/money"
import { useAuth } from "@/context/auth"

export default function Applications() {
    const { user } = useAuth()
    const [borrowers, setBorrowers] = useState<any[]>([])
    const [products, setProducts] = useState<any[]>([])
    const [apps, setApps] = useState<any[]>([])
    const [borrowerId, setBorrowerId] = useState("")
    const [productId, setProductId] = useState("")
    const [principal, setPrincipal] = useState(1000)

    const reload = async () => {
        setApps(await db.applications.reverse().sortBy("createdAt"))
        setBorrowers(await db.borrowers.orderBy("name").toArray())
        setProducts(await db.products.orderBy("name").toArray())
    }

    useEffect(() => {
        reload()
    }, [])

    const canCreate = useMemo(
        () => borrowerId && productId && principal > 0,
        [borrowerId, productId, principal]
    )

    // Map productId -> currency for display fallbacks
    const productCurrency = useMemo(() => {
        const m = new Map<string, string>()
        for (const p of products) m.set(p.id, p.currency)
        return m
    }, [products])

    // Find the selected product to label the principal field
    const selectedProduct = useMemo(
        () => products.find((p) => p.id === productId),
        [products, productId]
    )

    return (
        <div className="space-y-6">
            <Card title="New Application">
                <div className="grid gap-4 sm:grid-cols-4">
                    <div className="sm:col-span-1">
                        <label
                            htmlFor="application-borrower"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                            Borrower
                        </label>

                        <Select
                            id="application-borrower"
                            value={borrowerId}
                            onChange={(e) => setBorrowerId(e.target.value)}
                        >
                            <option value="">Select borrower</option>
                            {borrowers.map((b) => (
                                <option key={b.id} value={b.id}>
                                    {b.name}
                                </option>
                            ))}
                        </Select>
                    </div>

                    <div className="sm:col-span-1">
                        <label
                            htmlFor="application-product"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                            Product
                        </label>

                        <Select
                            id="application-product"
                            value={productId}
                            onChange={(e) => setProductId(e.target.value)}
                        >
                            <option value="">Select product</option>
                            {products.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.name}
                                </option>
                            ))}
                        </Select>
                    </div>

                    <div className="sm:col-span-1">
                        <label
                            htmlFor="application-principal"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                            Principal{" "}
                            {selectedProduct
                                ? `(${selectedProduct.currency})`
                                : ""}
                        </label>

                        <Input
                            id="application-principal"
                            type="number"
                            step="0.01"
                            value={principal}
                            onChange={(e) => setPrincipal(+e.target.value)}
                            placeholder="Amount"
                        />
                    </div>

                    <div className="sm:col-span-1 flex items-end">
                        <Button
                            disabled={!canCreate}
                            onClick={async () => {
                                await createApplication({
                                    borrowerId,
                                    productId,
                                    principal,
                                    notes: "",
                                })
                                setPrincipal(1000)
                                await reload()
                            }}
                        >
                            Create
                        </Button>
                    </div>
                </div>
            </Card>

            <Card title="Applications">
                <ul className="divide-y dark:divide-gray-800">
                    {apps.map((a) => {
                        // Prefer app.currency if present,
                        // else fall back to the product currency, else USD as a last resort.
                        const ccy =
                            a.currency ??
                            productCurrency.get(a.productId) ??
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
                                    {a.status === "draft" && (
                                        <Button
                                            onClick={async () => {
                                                await submitApplication(a.id)
                                                await reload()
                                            }}
                                        >
                                            Submit
                                        </Button>
                                    )}
                                    {a.status === "submitted" &&
                                        user?.role === "admin" && (
                                            <Button
                                                onClick={async () => {
                                                    try {
                                                        await approveApplication(
                                                            a.id,
                                                            user.id,
                                                            { role: user.role }
                                                        )
                                                        await reload()
                                                    } catch (e: any) {
                                                        alert(
                                                            e.message ||
                                                                "Approve failed"
                                                        )
                                                        console.error(e)
                                                    }
                                                }}
                                            >
                                                Approve
                                            </Button>
                                        )}
                                    <Link
                                        className="text-blue-500 rounded-md px-3 py-2 bg-blue-600/20"
                                        to={`/applications/${a.id}`}
                                    >
                                        Open
                                    </Link>
                                </div>
                            </li>
                        )
                    })}
                </ul>
            </Card>
        </div>
    )
}
