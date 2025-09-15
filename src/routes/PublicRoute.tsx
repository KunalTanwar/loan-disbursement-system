import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "@/context/auth"

export default function PublicRoute() {
    const { user } = useAuth()
    return user ? <Navigate to="/" replace /> : <Outlet />
}
