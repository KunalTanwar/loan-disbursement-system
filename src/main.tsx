import React from "react"
import { createRoot } from "react-dom/client"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import "./index.css"
import App from "./App"
import Dashboard from "./pages/Dashboard"
import Borrowers from "./pages/Borrowers"
import Products from "./pages/Products"
import Applications from "./pages/Applications"
import ApplicationDetail from "./pages/ApplicationDetail"
import Transactions from "./pages/Transactions"
import AuditLog from "./pages/AuditLog"

const qc = new QueryClient()

const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        children: [
            { index: true, element: <Dashboard /> },
            { path: "borrowers", element: <Borrowers /> },
            { path: "products", element: <Products /> },
            { path: "applications", element: <Applications /> },
            { path: "applications/:id", element: <ApplicationDetail /> },
            { path: "transactions", element: <Transactions /> },
            { path: "audits", element: <AuditLog /> },
        ],
    },
])

createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <QueryClientProvider client={qc}>
            <RouterProvider router={router} />
        </QueryClientProvider>
    </React.StrictMode>
)
