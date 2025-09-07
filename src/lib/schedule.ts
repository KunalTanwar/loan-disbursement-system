import type { RepaymentInstallment } from "@/types"

export function annuity(monthlyRate: number, n: number, principal: number) {
    if (monthlyRate === 0) {
        return principal / n
    }

    const r = monthlyRate

    return (principal * r) / (1 - Math.pow(1 + r, -n))
}

export function buildReducingSchedule(
    startDate: Date,
    principal: number,
    annualRatePct: number,
    months: number
): RepaymentInstallment[] {
    const r = annualRatePct / 100 / 12
    const pmt = annuity(r, months, principal)

    let bal = principal

    const out: RepaymentInstallment[] = []

    for (let i = 0; i < months; i++) {
        const interest = bal * r
        const principalDue = Math.min(pmt - interest, bal)

        bal = Math.max(0, bal - principalDue)

        const due = new Date(startDate)

        due.setMonth(due.getMonth() + i + 1)

        out.push({
            id: crypto.randomUUID(),
            dueDate: due.toISOString(),
            principalDue: +principalDue.toFixed(2),
            interestDue: +interest.toFixed(2),
            totalDue: +(principalDue + interest).toFixed(2),
        })
    }

    return out
}
