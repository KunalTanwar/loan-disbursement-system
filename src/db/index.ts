import Dexie, { type Table } from "dexie"
import type {
    User,
    Borrower,
    LoanProduct,
    LoanApplication,
    RepaymentSchedule,
    Repayment,
    Transaction,
    AuditEvent,
} from "@/types"

export class LoanDB extends Dexie {
    users!: Table<User, string>
    borrowers!: Table<Borrower, string>
    products!: Table<LoanProduct, string>
    applications!: Table<LoanApplication, string>
    schedules!: Table<RepaymentSchedule, string>
    repayments!: Table<Repayment, string>
    transactions!: Table<Transaction, string>
    audits!: Table<AuditEvent, string>

    constructor() {
        super("loan_disbursement_db")
        this.version(4).stores({
            users: "id, role, &email",
            borrowers: "id, userId, name, kycStatus, currency", // NEW: userId index
            products: "id, name, currency",
            applications:
                "id, borrowerId, productId, currency, status, createdAt, approvedAt, disbursedAt",
            schedules: "id, applicationId",
            repayments: "id, applicationId, installmentId, receivedAt",
            transactions:
                "id, type, currency, applicationId, borrowerId, createdAt",
            audits: "id, actorId, action, entity, entityId, at",
        })
    }
}

export const db = new LoanDB()
