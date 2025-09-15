import { useState } from "react"
import { useAuth } from "@/context/auth"
import { Card, Button, Input } from "@/components/ui"
import { useLocation, useNavigate } from "react-router-dom"

export default function Login() {
    const { login } = useAuth()
    const nav = useNavigate()
    const loc = useLocation()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [err, setErr] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    return (
        <div className="w-full max-w-lg mx-auto flex justify-center">
            <Card title="Welcome Back," className="w-full">
                <form
                    className="space-y-3"
                    onSubmit={async (e) => {
                        e.preventDefault()

                        setErr(null)

                        setLoading(true)

                        try {
                            await login(email, password)

                            nav((loc.state as any)?.from || "/", {
                                replace: true,
                            })
                        } catch (ex: any) {
                            setErr(ex.message || "Login failed")
                        } finally {
                            setLoading(false)
                        }
                    }}
                >
                    <div className="mt-4">
                        <label
                            htmlFor="login-email"
                            className="block text-sm font-medium"
                        >
                            Email
                        </label>

                        <Input
                            id="login-email"
                            required
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="login-password"
                            className="block text-sm font-medium"
                        >
                            Password
                        </label>

                        <Input
                            id="login-password"
                            required
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    {err && <div className="text-sm text-red-600">{err}</div>}

                    <Button type="submit" loading={loading}>
                        Login
                    </Button>
                </form>
            </Card>
        </div>
    )
}
