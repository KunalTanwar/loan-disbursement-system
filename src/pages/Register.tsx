import { useState } from "react"
import { useAuth } from "@/context/auth"
import { Card, Button, Input } from "@/components/ui"
import { validateRegisterClient } from "@/services/auth"
import { useLocation, useNavigate } from "react-router-dom"

export default function Register() {
    const { register } = useAuth()
    const nav = useNavigate()
    const loc = useLocation()
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [err, setErr] = useState<string | null>(null)
    const [fieldErr, setFieldErr] = useState<Record<string, string>>({})
    const [loading, setLoading] = useState(false)

    return (
        <div className="w-full max-w-lg mx-auto flex justify-center">
            <Card title="Create an Account" className="w-full">
                <form
                    className="space-y-3"
                    onSubmit={async (e) => {
                        e.preventDefault()

                        setErr(null)

                        const fe = validateRegisterClient(name, email, password)

                        setFieldErr(fe)

                        if (Object.keys(fe).length) {
                            ;(e.target as HTMLFormElement).reportValidity()

                            return
                        }
                        setLoading(true)

                        try {
                            await register(name, email, password)
                            nav((loc.state as any)?.from || "/", {
                                replace: true,
                            })
                        } catch (ex: any) {
                            setErr(ex.message || "Registration failed")
                        } finally {
                            setLoading(false)
                        }
                    }}
                >
                    <div className="mt-4">
                        <label
                            htmlFor="reg-name"
                            className="block text-sm font-medium"
                        >
                            Name
                        </label>

                        <Input
                            id="reg-name"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />

                        {fieldErr.name && (
                            <div className="text-xs text-red-600">
                                {fieldErr.name}
                            </div>
                        )}
                    </div>

                    <div>
                        <label
                            htmlFor="reg-email"
                            className="block text-sm font-medium"
                        >
                            Email Address
                        </label>

                        <Input
                            id="reg-email"
                            required
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />

                        {fieldErr.email && (
                            <div className="text-xs text-red-600">
                                {fieldErr.email}
                            </div>
                        )}
                    </div>

                    <div>
                        <label
                            htmlFor="reg-password"
                            className="block text-sm font-medium"
                        >
                            Password
                        </label>

                        <Input
                            id="reg-password"
                            required
                            type="password"
                            minLength={8}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />

                        {fieldErr.password && (
                            <div className="text-xs text-red-600">
                                {fieldErr.password}
                            </div>
                        )}
                    </div>

                    {err && <div className="text-sm text-red-600">{err}</div>}

                    <p className="text-sm text-gray-500">
                        By continuing, you agree to our{" "}
                        <span className="font-bold">Terms</span> and
                        <span className="font-bold"> Privacy Policy</span>.
                    </p>

                    <Button type="submit" loading={loading}>
                        Create account
                    </Button>
                </form>
            </Card>
        </div>
    )
}
