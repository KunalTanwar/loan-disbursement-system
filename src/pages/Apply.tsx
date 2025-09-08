// src/pages/Apply.tsx
import { useEffect, useMemo, useState } from "react"
import { db } from "../db"
import { useAuth } from "../context/auth"
import { Card, Button, Input, Select } from "../components/ui"
import { createApplication } from "../services/applications"

export default function Apply() {
    const { user } = useAuth()
    const [products, setProducts] = useState<any[]>([])
    const [productId, setProductId] = useState("")
    const [principal, setPrincipal] = useState(1000)
    const [note, setNote] = useState("")
    const [borrowerId, setBorrowerId] = useState<string | undefined>()
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        let active = true
        ;(async () => {
            const p = await db.products.orderBy("name").toArray()
            if (active) setProducts(p)
            const b = await db.borrowers
                .where("userId")
                .equals(user!.id)
                .first()
            if (active) setBorrowerId(b?.id)
            if (!b) {
                // create a borrower for the user lazily (currency default USD for demo)
                const newB = {
                    id: crypto.randomUUID(),
                    userId: user!.id,
                    name: user!.name,
                    email: user!.email,
                    kycStatus: "pending",
                    currency: "USD",
                }
                await db.borrowers.add(newB as any)
                setBorrowerId(newB.id)
            }
        })()
        return () => {
            active = false
        }
    }, [user?.id])

    const selectedProduct = useMemo(
        () => products.find((p) => p.id === productId),
        [products, productId]
    )
    const canApply = borrowerId && productId && principal > 0

    return (
        <div className="max-w-xl">
            <Card title="Apply for a Loan">
                <div className="space-y-3">
                    <div>
                        <label
                            htmlFor="apply-product"
                            className="block text-sm font-medium"
                        >
                            Product
                        </label>
                        <Select
                            id="apply-product"
                            required
                            value={productId}
                            onChange={(e) => setProductId(e.target.value)}
                        >
                            <option value="">Select product</option>
                            {products.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.name} ({p.currency})
                                </option>
                            ))}
                        </Select>
                    </div>
                    <div>
                        <label
                            htmlFor="apply-principal"
                            className="block text-sm font-medium"
                        >
                            Principal{" "}
                            {selectedProduct
                                ? `(${selectedProduct.currency})`
                                : ""}
                        </label>
                        <Input
                            id="apply-principal"
                            required
                            type="number"
                            step="0.01"
                            value={principal}
                            onChange={(e) => setPrincipal(+e.target.value)}
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="apply-note"
                            className="block text-sm font-medium"
                        >
                            Notes
                        </label>
                        <Input
                            id="apply-note"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                        />
                    </div>
                    <Button
                        disabled={!canApply || loading}
                        loading={loading}
                        onClick={async () => {
                            if (!canApply) return
                            setLoading(true)
                            try {
                                await createApplication(
                                    {
                                        borrowerId: borrowerId!,
                                        productId,
                                        principal,
                                        notes: note,
                                    },
                                    { id: user!.id, role: user!.role }
                                )
                                // optional: navigate to /my/applications
                                window.location.href = "/my/applications"
                            } finally {
                                setLoading(false)
                            }
                        }}
                    >
                        Submit Application
                    </Button>
                </div>
            </Card>
        </div>
    )
}
