import { useEffect, useState } from "react"
import { createBorrower, listBorrowers } from "@/services/borrowers"
import { Card, Button, Input, Select } from "@/components/ui"

export default function Borrowers() {
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [currency, setCurrency] = useState("USD")
    const [items, setItems] = useState<any[]>([])

    const reload = async () => setItems(await listBorrowers())

    useEffect(() => {
        reload()
    }, [])

    return (
        <div className="grid gap-6 sm:grid-cols-2">
            <Card title="New Borrower">
                <div className="space-y-4">
                    <div>
                        <label
                            htmlFor="borrower-name"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                            Name
                        </label>
                        <Input
                            id="borrower-name"
                            placeholder="Full name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="borrower-email"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                            Email
                        </label>
                        <Input
                            id="borrower-email"
                            type="email"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="borrower-currency"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                            Currency
                        </label>
                        <Select
                            id="borrower-currency"
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

                    <Button
                        onClick={async () => {
                            if (!name || !email) return
                            await createBorrower({ name, email, currency })
                            setName("")
                            setEmail("")
                            await reload()
                        }}
                    >
                        Save
                    </Button>
                </div>
            </Card>

            <Card title="Borrowers">
                <ul className="divide-y dark:divide-gray-800">
                    {items.map((b) => (
                        <li key={b.id} className="py-2">
                            <div className="font-medium">{b.name}</div>
                            <div className="text-xs text-gray-500">
                                {b.email} • {b.currency} • {b.kycStatus}
                            </div>
                        </li>
                    ))}
                </ul>
            </Card>
        </div>
    )
}
