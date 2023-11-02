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

const labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August']
const data = {
  labels,
  datasets: [
    {
      label: 'Dataset 1',
      data: [65, 59, 80, 81, 56, 55, 40, 99],
      backgroundColor: '#47B26B',
    },
  ],
};

export default function Chart() {
  return <Bar options={options} data={data} />;
}
