import { NavLink, Outlet } from "react-router-dom"

export default function App() {
    return (
        <div className="min-h-full">
            <header className="border-b border-b-gray-700 bg-white/80 backdrop-blur dark:bg-gray-900/80">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
                    <h1 className="text-xl font-semibold">Loan Disbursement</h1>

                    <nav className="flex gap-4 text-sm">
                        <NavLink
                            to="/"
                            className={({ isActive }) =>
                                isActive
                                    ? "font-medium text-blue-600"
                                    : "text-gray-600 dark:text-gray-300"
                            }
                        >
                            Dashboard
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
                    </nav>
                </div>
            </header>

            <main className="mx-auto max-w-7xl p-4">
                <Outlet />
            </main>
        </div>
    )
}
