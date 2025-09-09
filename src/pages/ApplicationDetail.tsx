import { useEffect, useMemo, useState } from "react"
import { useParams } from "react-router-dom"
import { db } from "../db"
import { disburseApplication } from "../services/applications"
import { postRepayment } from "../services/repayments"
import { Card, Button, Input, Select } from "../components/ui"
import { formatMoney } from "../lib/money"
import { useAuth } from "../context/auth"

export default function ApplicationDetail() {
    const { user } = useAuth()
    const { id } = useParams<{ id: string }>()
    const [app, setApp] = useState<any>(null)
    const [product, setProduct] = useState<any>(null)
    const [schedule, setSchedule] = useState<any>(null)
    const [repayAmount, setRepayAmount] = useState<number>(0)
    const [currency, setCurrency] = useState("USD")

    // Determine the application currency for display (app.currency preferred, else product.currency)
    const appCurrency = app?.currency ?? product?.currency ?? "USD"

    const reload = async () => {
        const a = await db.applications.get(id!)
        setApp(a)
        const p = a ? await db.products.get(a.productId) : null
        setProduct(p)
        setSchedule(
            a
                ? await db.schedules.where("applicationId").equals(a.id).first()
                : null
        )
        setCurrency(p?.currency ?? "USD")
    }

    useEffect(() => {
        reload()
    }, [id])

    const nextInst = useMemo(
        () => schedule?.installments?.find((i: any) => !i.paid),
        [schedule]
    )

    return (
        <div className="space-y-6">
            <Card title="Application">
                {app ? (
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <div className="font-medium">{app.id}</div>
                            <div className="text-sm text-gray-500">
                                <strong>Status :</strong> {app.status} •{" "}
                                <strong>Principal :</strong>{" "}
                                {formatMoney(app.principal, appCurrency)}
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {app.status === "approved" &&
                                user?.role === "admin" && (
                                    <Button
                                        onClick={async () => {
                                            try {
                                                await disburseApplication(
                                                    app.id,
                                                    "BANK-001",
                                                    product?.currency ?? "USD",
                                                    {
                                                        id: user.id,
                                                        role: user.role,
                                                    }
                                                )
                                                await reload()
                                            } catch (e: any) {
                                                alert(
                                                    e.message ||
                                                        "Disburse failed"
                                                )
                                                console.error(e)
                                            }
                                        }}
                                    >
                                        Disburse
                                    </Button>
                                )}
                        </div>
                    </div>
                ) : (
                    <div>Loading...</div>
                )}
            </Card>

            <div className="grid gap-6 sm:grid-cols-2">
                <Card title="Schedule">
                    <ul className="max-h-[420px] divide-y overflow-auto text-sm dark:divide-gray-800 pr-5">
                        {schedule?.installments?.map((i: any, idx: number) => (
                            <li
                                key={i.id}
                                className="flex items-center justify-between py-2"
                            >
                                <div>
                                    #{idx + 1} •{" "}
                                    {new Date(i.dueDate).toLocaleDateString()}
                                </div>
                                <div className="tabular-nums">
                                    {formatMoney(i.totalDue, appCurrency)}{" "}
                                    {i.paid && (
                                        <span className="text-green-600">
                                            Paid
                                        </span>
                                    )}
                                </div>
                            </li>
                        )) ?? <li>No schedule.</li>}
                    </ul>
                </Card>

                <Card title="Post Repayment">
                    {nextInst ? (
                        <div className="space-y-3">
                            <div className="text-sm">
                                Next due:{" "}
                                <span className="font-medium">
                                    {formatMoney(
                                        nextInst.totalDue,
                                        appCurrency
                                    )}
                                </span>
                            </div>
                            <div>
                                <label
                                    htmlFor="repayment-amount"
                                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                                >
                                    Amount
                                </label>
                                <Input
                                    id="repayment-amount"
                                    type="number"
                                    step="0.01"
                                    value={repayAmount}
                                    onChange={(e) =>
                                        setRepayAmount(+e.target.value)
                                    }
                                    placeholder="Amount"
                                />
                            </div>
                            <div>
                                <label
                                    htmlFor="repayment-currency"
                                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                                >
                                    Currency
                                </label>
                                <Select
                                    id="repayment-currency"
                                    value={currency}
                                    onChange={(e) =>
                                        setCurrency(e.target.value)
                                    }
                                >
                                    {[
                                        "USD",
                                        "INR",
                                        "EUR",
                                        "GBP",
                                        "JPY",
                                        "AUD",
                                        "CAD",
                                        "AED",
                                        "SGD",
                                        "CHF",
                                    ].map((c) => (
                                        <option key={c} value={c}>
                                            {c}
                                        </option>
                                    ))}
                                </Select>
                            </div>
                            <Button
                                onClick={async () => {
                                    await postRepayment(
                                        app.id,
                                        nextInst.id,
                                        repayAmount || nextInst.totalDue,
                                        currency
                                    )
                                    setRepayAmount(0)
                                    await reload()
                                }}
                            >
                                Record Payment
                            </Button>
                        </div>
                    ) : (
                        <div className="text-sm text-gray-500">
                            No upcoming installments.
                        </div>
                    )}
                </Card>
            </div>
        </div>
    )
}
