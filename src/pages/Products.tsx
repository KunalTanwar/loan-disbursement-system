import { useEffect, useState } from "react"
import { createProduct, listProducts } from "@/services/products"
import { Card, Button, Input, Select } from "@/components/ui"

export default function Products() {
    const [name, setName] = useState("")
    const [currency, setCurrency] = useState("USD")
    const [interestRate, setInterestRate] = useState(12)
    const [interestType, setInterestType] = useState<"flat" | "reducing">(
        "reducing"
    )
    const [termMonths, setTermMonths] = useState(12)
    const [processingFeePct, setProcessingFeePct] = useState(1)
    const [penaltyPct, setPenaltyPct] = useState(2)
    const [items, setItems] = useState<any[]>([])

    const reload = async () => setItems(await listProducts())
    useEffect(() => {
        reload()
    }, [])

    return (
        <div className="grid gap-6 sm:grid-cols-2">
            <Card title="New Product">
                <div className="space-y-4">
                    <div>
                        <label
                            htmlFor="product-name"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                            Name
                        </label>
                        <Input
                            id="product-name"
                            placeholder="e.g., Personal Loan"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="product-currency"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                            Currency
                        </label>
                        <Select
                            id="product-currency"
                            value={currency}
                            onChange={(e) => setCurrency(e.target.value)}
                        >
                            {["USD", "INR", "EUR", "GBP"].map((c) => (
                                <option key={c} value={c}>
                                    {c}
                                </option>
                            ))}
                        </Select>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <label
                                htmlFor="product-interest-rate"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                                Interest % (annual)
                            </label>
                            <Input
                                id="product-interest-rate"
                                type="number"
                                step="0.01"
                                placeholder="e.g., 12"
                                value={interestRate}
                                onChange={(e) =>
                                    setInterestRate(+e.target.value)
                                }
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="product-interest-type"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                                Interest type
                            </label>
                            <Select
                                id="product-interest-type"
                                value={interestType}
                                onChange={(e) =>
                                    setInterestType(e.target.value as any)
                                }
                            >
                                <option value="reducing">Reducing</option>
                                <option value="flat">Flat</option>
                            </Select>
                        </div>

                        <div>
                            <label
                                htmlFor="product-term-months"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                                Term (months)
                            </label>
                            <Input
                                id="product-term-months"
                                type="number"
                                placeholder="e.g., 12"
                                value={termMonths}
                                onChange={(e) => setTermMonths(+e.target.value)}
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="product-processing-fee"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                                Processing fee %
                            </label>
                            <Input
                                id="product-processing-fee"
                                type="number"
                                step="0.01"
                                placeholder="e.g., 1"
                                value={processingFeePct}
                                onChange={(e) =>
                                    setProcessingFeePct(+e.target.value)
                                }
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="product-penalty-pct"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                                Penalty %
                            </label>
                            <Input
                                id="product-penalty-pct"
                                type="number"
                                step="0.01"
                                placeholder="e.g., 2"
                                value={penaltyPct}
                                onChange={(e) => setPenaltyPct(+e.target.value)}
                            />
                        </div>
                    </div>

                    <Button
                        onClick={async () => {
                            if (!name) return
                            await createProduct({
                                name,
                                currency,
                                interestRate,
                                interestType,
                                termMonths,
                                processingFeePct,
                                penaltyPct,
                            })
                            setName("")
                            await reload()
                        }}
                    >
                        Save
                    </Button>
                </div>
            </Card>

            <Card title="Products">
                <ul className="divide-y dark:divide-gray-800">
                    {items.map((p) => (
                        <li key={p.id} className="py-2">
                            <div className="font-medium">{p.name}</div>
                            <div className="text-xs text-gray-500">
                                {p.currency} • {p.interestRate}%{" "}
                                {p.interestType} • {p.termMonths}m
                            </div>
                        </li>
                    ))}
                </ul>
            </Card>
        </div>
    )
}
