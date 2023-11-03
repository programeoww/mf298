import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const options = {
  responsive: true,
  plugins: {
    legend: {
      display: false,
    },
  },
  maintainAspectRatio: false,
  scales: {
    y: {
      min: 0,
      max: 200,
    }
  },
};

const initData = {
  labels: [],
  datasets: [
    {
      label: 'Dataset 1',
      data: [],
      backgroundColor: '#47B26B',
    },
  ],
};

export default function Chart({className, data} : {className?: string, data?: any}) {
  return <Bar className={className} options={options} data={data || initData} />;
}
