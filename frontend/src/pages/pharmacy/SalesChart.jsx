import React from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler // Important for the area fill under the line
} from 'chart.js';

// Register all the necessary components for Chart.js to work
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const SalesChart = ({ salesData = [] }) => {

    const chartData = {
        // Use the 'date' property from each data object for the x-axis labels
        labels: salesData.map(d => d.date),
        datasets: [
            {
                label: 'Sales ($)',
                // Use the 'totalSales' property for the y-axis data points
                data: salesData.map(d => d.totalSales),
                borderColor: 'rgba(37, 99, 235, 1)', // Primary blue color for the line
                backgroundColor: 'rgba(37, 99, 235, 0.2)', // Light blue for the area fill
                fill: true, // This fills the area under the line
                tension: 0.4, // This makes the line smooth and curved
                pointBackgroundColor: 'rgba(37, 99, 235, 1)',
                pointBorderColor: '#fff',
                pointHoverRadius: 7,
                pointHoverBackgroundColor: 'rgba(37, 99, 235, 1)',
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false, // Allows the chart to fill its container's height
        plugins: {
            legend: {
                display: false, // Hide the legend as there's only one dataset
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleFont: { size: 14 },
                bodyFont: { size: 12 },
                callbacks: {
                    // Custom tooltip label to show sales with a dollar sign
                    label: function (context) {
                        return ` Sales: $${context.parsed.y.toFixed(2)}`;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    // Format the y-axis labels to include a dollar sign
                    callback: function (value) {
                        return '$' + value;
                    }
                }
            },
            x: {
                grid: {
                    display: false, // Hide the vertical grid lines for a cleaner look
                }
            }
        }
    };

    // The chart container needs a specific height to render properly within its parent
    return (
        <div style={{ position: 'relative', height: '300px' }}>
            <Line options={chartOptions} data={chartData} />
        </div>
    );
};

export default SalesChart;

