export async function convertAmount(
    amount: number,
    from: string,
    to: string,
    date?: string
) {
    if (from === to) {
        return { result: amount, rate: 1 }
    }

    const q = new URLSearchParams({ from, to, amount: String(amount) })

    if (date) q.set("date", date) // historical conversion

    const res = await fetch(
        `https://api.exchangerate.host/convert?${q.toString()}`
    )

    if (!res.ok) {
        throw new Error("FX error")
    }

    const json = await res.json()

    return {
        result: json.result as number,
        rate: json.info?.rate as number,
        date,
    } // rate/date per docs
}

export async function latestRates(base: string) {
    const res = await fetch(
        `https://api.exchangerate.host/latest?base=${encodeURIComponent(base)}`
    )

    if (!res.ok) {
        throw new Error("FX error")
    }

    return res.json()
}
