import {
    NavLink,
    Outlet,
    Link,
    useNavigate,
    useLocation,
} from "react-router-dom"
import NotificationBell from "./components/ui"
import { useAuth } from "./context/auth"
import { useEffect, useRef, useState } from "react"

function linkCls({ isActive }: { isActive: boolean }) {
    return isActive
        ? "font-medium text-blue-600"
        : "text-gray-600 dark:text-gray-300"
}

export default function App() {
    const { user, logout } = useAuth()
    const nav = useNavigate()

    const { pathname } = useLocation()

    const headerRef = useRef<HTMLElement | null>(null)

    const [headerHeight, setHeaderHeight] = useState(0)

    useEffect(() => {
        const updateHeight = () => {
            if (headerRef.current) {
                setHeaderHeight(headerRef.current.offsetHeight)
            }
        }

        updateHeight()

        window.addEventListener("resize", updateHeight)

        return () => window.removeEventListener("resize", updateHeight)
    }, [])

    return (
        <div className="min-h-full">
            <header
                className="border-b border-b-gray-700 bg-white/80 backdrop-blur dark:bg-gray-900/80"
                ref={headerRef}
            >
                <div className="mx-auto flex max-w-7xl items-center justify-between px-12 py-6">
                    <h1 className="text-xl font-semibold">
                        <Link to="/">Loan Disbursement</Link>
                    </h1>

                    <nav className="flex items-center gap-4">
                        {/* Customer navigation */}
                        {user?.role === "customer" && (
                            <>
                                <NavLink to="/me" className={linkCls}>
                                    My Dashboard
                                </NavLink>

                                <NavLink
                                    to="/my/applications"
                                    className={linkCls}
                                >
                                    My Applications
                                </NavLink>

                                <NavLink
                                    to="/my/transactions"
                                    className={linkCls}
                                >
                                    My Transactions
                                </NavLink>

                                <NavLink to="/catalog" className={linkCls}>
                                    Catalog
                                </NavLink>

                                <NavLink to="/apply" className={linkCls}>
                                    Apply
                                </NavLink>

                                <NavLink to="/payment-plan" className={linkCls}>
                                    Payment Plan
                                </NavLink>
                            </>
                        )}

                        {/* Staff/admin navigation */}
                        {user && user.role !== "customer" && (
                            <>
                                <NavLink to="/" end className={linkCls}>
                                    Dashboard
                                </NavLink>

                                <NavLink to="/applications" className={linkCls}>
                                    Applications
                                </NavLink>

                                <NavLink to="/borrowers" className={linkCls}>
                                    Borrowers
                                </NavLink>

                                <NavLink to="/products" className={linkCls}>
                                    Products
                                </NavLink>

                                <NavLink to="/transactions" className={linkCls}>
                                    Transactions
                                </NavLink>

                                <NavLink to="/audits" className={linkCls}>
                                    Audits
                                </NavLink>
                            </>
                        )}

                        {/* Right controls */}
                        <div className="flex items-center gap-4">
                            {user ? (
                                <>
                                    <NotificationBell />

                                    <button
                                        onClick={() => {
                                            logout()
                                            nav("/login", { replace: true })
                                        }}
                                        className="rounded cursor-pointer border px-4 py-2 bg-red-800 border-red-950"
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <NavLink to="/login" className={linkCls}>
                                        Login
                                    </NavLink>

                                    <NavLink to="/register" className={linkCls}>
                                        Register
                                    </NavLink>
                                </>
                            )}
                        </div>
                    </nav>
                </div>
            </header>

            <main
                className={`mx-auto max-w-7xl px-12 ${
                    pathname === "/login" ||
                    pathname === "/register" ||
                    pathname === "/apply"
                        ? "flex items-center justify-center"
                        : "pt-6"
                }`}
                style={{
                    height: `calc(100vh - ${headerHeight}px)`,
                }}
            >
                <Outlet />
            </main>
        </div>
    )
}
