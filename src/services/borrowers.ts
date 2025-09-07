import { db } from "@/db"
import { type Borrower } from "@/types"

export async function listBorrowers() {
    return db.borrowers.orderBy("name").toArray()
}

export async function createBorrower(
    b: Omit<Borrower, "id" | "kycStatus"> & {
        kycStatus?: Borrower["kycStatus"]
    }
) {
    const borrower: Borrower = {
        id: crypto.randomUUID(),
        kycStatus: "pending",
        ...b,
    }

    await db.borrowers.add(borrower)

    return borrower
}
