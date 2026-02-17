
import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

interface CreditDebitChartProps {
  credit: number;
  debit: number;
}

const CreditDebitChart: React.FC<CreditDebitChartProps> = ({ credit, debit }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (chartRef.current) {
        if (chartInstanceRef.current) {
            chartInstanceRef.current.destroy();
        }
      const ctx = chartRef.current.getContext('2d');
      if (ctx) {
        chartInstanceRef.current = new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: ['Credit', 'Debit'],
            datasets: [{
              data: [credit, debit],
              backgroundColor: ['#34d399', '#ef4444'],
              borderColor: ['#1f2937'],
              borderWidth: 2,
              hoverOffset: 4
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
              legend: {
                position: 'bottom',
                labels: {
                    color: '#9ca3af',
                    boxWidth: 12,
                    padding: 20
                }
              },
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
  }, [credit, debit]);

  return <div className="h-64"><canvas ref={chartRef}></canvas></div>;
};

export default CreditDebitChart;
