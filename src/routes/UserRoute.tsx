import { Navigate, Outlet, useLocation, useParams } from "react-router-dom"
import { useAuth } from "../context/auth"

export default function UserRoute() {
    const { user } = useAuth()
    const { id } = useParams()
    const loc = useLocation()

    if (!user) {
        return <Navigate to="/login" replace state={{ from: loc.pathname }} />
    }

    if (user.id !== id) {
        return <Navigate to="/me" replace />
    }

    return <Outlet />
}
