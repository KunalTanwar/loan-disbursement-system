import { useAuth } from "./context/auth"
import NotificationBell from "./components/ui"
import { NavLink, Link, Outlet, useNavigate } from "react-router-dom"

export default function App() {
    const { user, logout } = useAuth()
    const nav = useNavigate()

    const CustomerLinks = () => (
        <>
            <NavLink
                to="/me"
                className={({ isActive }) =>
                    isActive
                        ? "font-medium text-blue-600"
                        : "text-gray-600 dark:text-gray-300"
                }
            >
                My Dashboard
            </NavLink>
            <NavLink
                to="/my/applications"
                className={({ isActive }) =>
                    isActive
                        ? "font-medium text-blue-600"
                        : "text-gray-600 dark:text-gray-300"
                }
            >
                My Applications
            </NavLink>
            <NavLink
                to="/my/transactions"
                className={({ isActive }) =>
                    isActive
                        ? "font-medium text-blue-600"
                        : "text-gray-600 dark:text-gray-300"
                }
            >
                My Transactions
            </NavLink>
            <NavLink
                to="/catalog"
                className={({ isActive }) =>
                    isActive
                        ? "font-medium text-blue-600"
                        : "text-gray-600 dark:text-gray-300"
                }
            >
                Catalog
            </NavLink>
            <NavLink
                to="/apply"
                className={({ isActive }) =>
                    isActive
                        ? "font-medium text-blue-600"
                        : "text-gray-600 dark:text-gray-300"
                }
            >
                Apply
            </NavLink>
        </>
    )

    const StaffLinks = () => (
        <>
            <NavLink
                to="/"
                end
                className={({ isActive }) =>
                    isActive
                        ? "font-medium text-blue-600"
                        : "text-gray-600 dark:text-gray-300"
                }
            >
                Dashboard
            </NavLink>
            <NavLink
                to="/applications"
                className={({ isActive }) =>
                    isActive
                        ? "font-medium text-blue-600"
                        : "text-gray-600 dark:text-gray-300"
                }
            >
                Applications
            </NavLink>
            <NavLink
                to="/borrowers"
                className={({ isActive }) =>
                    isActive
                        ? "font-medium text-blue-600"
                        : "text-gray-600 dark:text-gray-300"
                }
            >
                Borrowers
            </NavLink>
            <NavLink
                to="/products"
                className={({ isActive }) =>
                    isActive
                        ? "font-medium text-blue-600"
                        : "text-gray-600 dark:text-gray-300"
                }
            >
                Products
            </NavLink>
            <NavLink
                to="/transactions"
                className={({ isActive }) =>
                    isActive
                        ? "font-medium text-blue-600"
                        : "text-gray-600 dark:text-gray-300"
                }
            >
                Transactions
            </NavLink>
            <NavLink
                to="/audits"
                className={({ isActive }) =>
                    isActive
                        ? "font-medium text-blue-600"
                        : "text-gray-600 dark:text-gray-300"
                }
            >
                Audits
            </NavLink>
        </>
    )

    return (
        <div className="min-h-full">
            <header className="border-b bg-white/80 backdrop-blur dark:bg-gray-900/80">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
                    <h1 className="text-xl font-semibold">
                        <Link to="/">Loan Disbursement</Link>
                    </h1>
                    <nav className="flex items-center gap-4 text-sm">
                        {user?.role === "customer" && <CustomerLinks />}
                        {user && user.role !== "customer" && <StaffLinks />}
                        <div className="ml-4 flex items-center gap-3">
                            {user ? (
                                <>
                                    {user.role && <NotificationBell />}
                                    {/* hidden for guests */}
                                    <button
                                        onClick={() => {
                                            logout()
                                            nav("/login", { replace: true })
                                        }}
                                        className="rounded-md border px-2 py-1 text-xs hover:bg-gray-100 dark:hover:bg-gray-800"
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <NavLink
                                        to="/login"
                                        className={({ isActive }) =>
                                            isActive
                                                ? "font-medium text-blue-600"
                                                : "text-gray-600 dark:text-gray-300"
                                        }
                                    >
                                        Login
                                    </NavLink>
                                    <NavLink
                                        to="/register"
                                        className={({ isActive }) =>
                                            isActive
                                                ? "font-medium text-blue-600"
                                                : "text-gray-600 dark:text-gray-300"
                                        }
                                    >
                                        Register
                                    </NavLink>
                                </>
                            )}
                        </div>
                    </nav>
                </div>
            </header>
            <main className="mx-auto max-w-7xl p-4">
                <Outlet />
            </main>
        </div>
    )
}
