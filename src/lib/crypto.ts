function toB64(a: ArrayBuffer) {
    return btoa(String.fromCharCode(...new Uint8Array(a)))
}
function fromText(s: string) {
    return new TextEncoder().encode(s)
}

export async function hashPassword(password: string, iterations = 100_000) {
    const salt = crypto.getRandomValues(new Uint8Array(16))
    const keyMaterial = await crypto.subtle.importKey(
        "raw",
        fromText(password),
        { name: "PBKDF2" },
        false,
        ["deriveBits"]
    )
    const bits = await crypto.subtle.deriveBits(
        { name: "PBKDF2", salt, iterations, hash: "SHA-256" },
        keyMaterial,
        256
    )
    return {
        algo: "PBKDF2" as const,
        hashAlg: "SHA-256" as const,
        iterations,
        salt: toB64(salt.buffer),
        hash: toB64(bits),
    }
}

export async function verifyPassword(
    password: string,
    record: { iterations: number; salt: string; hash: string }
) {
    const salt = Uint8Array.from(atob(record.salt), (c) => c.charCodeAt(0))
    const keyMaterial = await crypto.subtle.importKey(
        "raw",
        fromText(password),
        { name: "PBKDF2" },
        false,
        ["deriveBits"]
    )

    const bits = await crypto.subtle.deriveBits(
        {
            name: "PBKDF2",
            salt,
            iterations: record.iterations,
            hash: "SHA-256",
        },
        keyMaterial,
        256
    )

    return toB64(bits) === record.hash
}
