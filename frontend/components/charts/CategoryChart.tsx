
import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

interface CategoryChartProps {
  spendingData: { [key: string]: number };
}

const CategoryChart: React.FC<CategoryChartProps> = ({ spendingData }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (chartRef.current) {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
      const ctx = chartRef.current.getContext('2d');
      if (ctx) {
        const labels = Object.keys(spendingData);
        const data = Object.values(spendingData);
        
        const chartColors = [
            '#22d3ee', '#34d399', '#f59e0b', '#ec4899', '#8b5cf6',
            '#60a5fa', '#ef4444', '#a3e635', '#f472b6', '#a78bfa'
        ];

        chartInstanceRef.current = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: labels,
            datasets: [{
              label: 'Spending',
              data: data,
              backgroundColor: chartColors,
              borderColor: chartColors,
              borderWidth: 1
            }]
          },
          options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: {
                beginAtZero: true,
                grid: { color: 'rgba(255, 255, 255, 0.1)' },
                ticks: { color: '#9ca3af' }
              },
              y: {
                grid: { color: 'rgba(255, 255, 255, 0.05)' },
                ticks: { color: '#9ca3af' }
              }
            },
            plugins: {
              legend: { display: false },
              tooltip: {
                backgroundColor: '#1f2937',
                titleColor: '#e5e7eb',
                bodyColor: '#d1d5db',
              }
            }
          }
        });
      }
    }
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [spendingData]);

  return <div className="h-64"><canvas ref={chartRef}></canvas></div>;
};

export default CategoryChart;
