import { Bar } from "react-chartjs-2"
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend,
} from "chart.js"
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

export function DisbursementsByMonth({
    labels,
    data,
}: {
    labels: string[]
    data: number[]
}) {
    return (
        <div className="h-full rounded-lg border p-4 dark:border-gray-800">
            <Bar
                data={{
                    labels,
                    datasets: [
                        {
                            label: "Disbursed",
                            data,
                            backgroundColor: "rgba(59,130,246,0.6)",
                        },
                    ],
                }}
                options={{
                    responsive: true,
                    plugins: { legend: { display: true } },
                    scales: { y: { beginAtZero: true } },
                }}
            />
        </div>
    )
}
