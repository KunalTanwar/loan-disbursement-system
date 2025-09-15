import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useAuth } from "@/context/auth"

type Role = "admin" | "officer" | "auditor" | "customer"

export default function ProtectedRoute({ roles }: { roles?: Role[] }) {
    const { user } = useAuth()
    const loc = useLocation()

    if (!user) {
        return <Navigate to="/login" replace state={{ from: loc.pathname }} />
    }

    if (roles?.length && !roles.includes(user.role as Role)) {
        return <Navigate to="/" replace />
    }
    return <Outlet />
}
