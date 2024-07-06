import React, { useEffect, useRef } from 'react';
import { Chart } from 'chart.js/auto';

const MyChart = ({ data }) => {
    const chartRef = useRef(null);
    const chartInstanceRef = useRef(null);

    useEffect(() => {
        // Function to create or update the chart
        const createOrUpdateChart = () => {
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
            }

            chartInstanceRef.current = new Chart(chartRef.current, {
                type: 'line', // or 'line', 'pie', etc.
                data: data,
                options: {
                    scale: {
                        yAxes: [
                          {
                            ticks: {
                              beginAtZero: true
                            }
                          }
                        ]
                    }  
                }
            });
        };

        createOrUpdateChart();

        // Cleanup function to destroy the chart instance
        return () => {
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
            }
        };
    }, [data]); // Re-run the effect if data changes

    return <canvas ref={chartRef} />;
};

export default MyChart;
