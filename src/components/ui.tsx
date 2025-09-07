import React from "react"

export function Card(
    props: React.PropsWithChildren<{ title?: string; className?: string }>
) {
    return (
        <div
            className={`rounded-lg border bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 ${
                props.className ?? ""
            }`}
        >
            {props.title && (
                <h3 className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                    {props.title}
                </h3>
            )}
            {props.children}
        </div>
    )
}

export function Button(
    props: React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }
) {
    const { loading, className, ...rest } = props
    return (
        <button
            {...rest}
            className={`inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-white hover:bg-blue-700 disabled:opacity-50 ${
                className ?? ""
            }`}
            aria-busy={loading ? "true" : undefined}
            disabled={loading || props.disabled}
        >
            {loading && (
                <span className="inline-block size-4 animate-spin rounded-full border-2 border-white/60 border-t-transparent" />
            )}
            {props.children}
        </button>
    )
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
    return (
        <input
            {...props}
            className={`w-full rounded-md border px-3 py-2 dark:border-gray-800 dark:bg-gray-950 ${
                props.className ?? ""
            }`}
        />
    )
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
    return (
        <select
            {...props}
            className={`w-full rounded-md border px-3 py-2 dark:border-gray-800 dark:bg-gray-950 ${
                props.className ?? ""
            }`}
        />
    )
}
