import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import api from '../../api/axiosConfig';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const SalesChart = () => {
    const [chartData, setChartData] = useState({ labels: [], datasets: [] });

    useEffect(() => {
        const fetchChartData = async () => {
            try {
                const { data } = await api.get('/reports/sales-chart');
                setChartData({
                    labels: data.labels,
                    datasets: [
                        {
                            label: 'Sales ($)',
                            data: data.data,
                            borderColor: 'rgb(37, 99, 235)',
                            backgroundColor: 'rgba(37, 99, 235, 0.5)',
                            tension: 0.3,
                        },
                    ],
                });
            } catch (error) {
                console.error("Failed to fetch chart data:", error);
            }
        };
        fetchChartData();
    }, []);

    const options = {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
            y: { beginAtZero: true }
        }
    };

    return <Line options={options} data={chartData} />;
};

export default SalesChart;
