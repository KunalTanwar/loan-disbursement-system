import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { db } from "@/db"
import {
    createApplication,
    submitApplication,
    approveApplication,
} from "@/services/applications"
import { Card, Button, Input, Select } from "@/components/ui"

export default function Applications() {
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
                            {productId &&
                            products.find((p) => p.id === productId)?.currency
                                ? `(${
                                      products.find((p) => p.id === productId)!
                                          .currency
                                  })`
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
                    {apps.map((a) => (
                        <li
                            key={a.id}
                            className="flex items-center justify-between py-3"
                        >
                            <div>
                                <div className="font-medium">
                                    {a.id.slice(0, 8)} • $
                                    {a.principal.toFixed(2)}
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
                                {a.status === "submitted" && (
                                    <Button
                                        onClick={async () => {
                                            await approveApplication(
                                                a.id,
                                                "admin-1"
                                            )
                                            await reload()
                                        }}
                                    >
                                        Approve
                                    </Button>
                                )}
                                <Link
                                    className="text-blue-600"
                                    to={`/applications/${a.id}`}
                                >
                                    Open
                                </Link>
                            </div>
                        </li>
                    ))}
                </ul>
            </Card>
        </div>
    )
}
