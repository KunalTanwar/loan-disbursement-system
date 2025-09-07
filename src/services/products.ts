import { db } from "@/db"
import { type LoanProduct } from "@/types"

export async function listProducts() {
    return db.products.orderBy("name").toArray()
}

export async function createProduct(p: Omit<LoanProduct, "id">) {
    const product: LoanProduct = { id: crypto.randomUUID(), ...p }

    await db.products.add(product)

    return product
}
