export type ID = string

export interface User {
    id: ID
    name: string
    email: string
    role: "admin" | "officer" | "auditor" | "customer"
    password?: PasswordRecord // stored hash; never store plaintext
}

export interface Borrower {
    id: ID
    userId?: ID
    name: string
    email: string
    phone?: string
    kycStatus: "pending" | "verified" | "rejected"
    currency: string
}

export interface LoanProduct {
    id: ID
    name: string
    currency: string
    interestRate: number
    interestType: "flat" | "reducing"
    termMonths: number
    processingFeePct: number
    penaltyPct: number
}

export interface LoanApplication {
    id: ID
    borrowerId: ID
    productId: ID
    principal: number
    currency: string // NEW: application currency (usually product.currency)
    status: "draft" | "submitted" | "approved" | "rejected" | "disbursed"
    createdAt: string
    approvedAt?: string
    disbursedAt?: string
    approverId?: ID
    notes?: string
}

export interface Disbursement {
    id: ID
    applicationId: ID
    amount: number
    currency: string
    account: string
    executedAt: string
}

export interface RepaymentSchedule {
    id: ID
    applicationId: ID
    installments: RepaymentInstallment[]
}

export interface RepaymentInstallment {
    id: ID
    dueDate: string
    principalDue: number
    interestDue: number
    totalDue: number
    paid?: boolean
    paidAt?: string
}

export interface Repayment {
    id: ID
    applicationId: ID
    installmentId: ID
    amount: number
    currency: string
    receivedAt: string
}

export interface Transaction {
    id: ID
    type: "disbursement" | "repayment" | "fee" | "penalty"
    amount: number
    currency: string // currency of this transaction
    createdAt: string
    meta?: {
        account?: string
        fx?: {
            from: string
            to: string
            rate: number
            date?: string
            amountSource?: number
        }
        [k: string]: unknown
    }
    applicationId?: ID
    borrowerId?: ID
}

export interface AuditEvent {
    id: ID
    actorId: ID
    action: string
    entity: string
    entityId: ID
    at: string
    diff?: Record<string, unknown>
}

export interface PasswordRecord {
    algo: "PBKDF2"
    hash: string // base64
    salt: string // base64
    iterations: number // e.g. 100_000
    hashAlg: "SHA-256"
}
