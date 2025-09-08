import React from "react"
import { createRoot } from "react-dom/client"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import { AuthProvider } from "./context/auth"

import "./index.css"

import App from "./App"
import ProtectedRoute from "./routes/ProtectedRoute"
import Dashboard from "./pages/Dashboard"
import Borrowers from "./pages/Borrowers"
import Products from "./pages/Products"
import Applications from "./pages/Applications"
import ApplicationDetail from "./pages/ApplicationDetail"
import Transactions from "./pages/Transactions"
import AuditLog from "./pages/AuditLog"
import UserDashboard from "./pages/UserDashboard"
import Login from "./pages/Login"
import Register from "./pages/Register"
import UserRoute from "./routes/UserRoute"
import MyApplications from "./pages/MyApplication"
import MyTransactions from "./pages/MyTransactions"
import ProductsCatalog from "./pages/ProductsCatalog"
import Apply from "./pages/Apply"

const qc = new QueryClient()

const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        children: [
            { path: "login", element: <Login /> },
            { path: "register", element: <Register /> },

            // Customer-only branch: only personal pages and catalog
            {
                element: <ProtectedRoute roles={["customer"]} />,
                children: [
                    { index: true, element: <UserDashboard /> }, // default home for customers
                    { path: "me", element: <UserDashboard /> }, // convenience
                    {
                        path: "users/:id",
                        element: <UserRoute />,
                        children: [{ index: true, element: <UserDashboard /> }],
                    },
                    { path: "my/applications", element: <MyApplications /> },
                    { path: "my/transactions", element: <MyTransactions /> },
                    { path: "catalog", element: <ProductsCatalog /> }, // read-only products list
                    { path: "apply", element: <Apply /> }, // apply form
                ],
            },

            // Staff/admin branch: ops pages
            {
                element: (
                    <ProtectedRoute roles={["admin", "officer", "auditor"]} />
                ),
                children: [
                    { index: true, element: <Dashboard /> }, // staff dashboard
                    { path: "applications", element: <Applications /> },
                    {
                        path: "applications/:id",
                        element: <ApplicationDetail />,
                    },
                    { path: "transactions", element: <Transactions /> },
                    { path: "audits", element: <AuditLog /> },
                    { path: "borrowers", element: <Borrowers /> },
                    { path: "products", element: <Products /> },
                ],
            },
        ],
    },
])

createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <QueryClientProvider client={qc}>
            <AuthProvider>
                <RouterProvider router={router} />
            </AuthProvider>
        </QueryClientProvider>
    </React.StrictMode>
)
