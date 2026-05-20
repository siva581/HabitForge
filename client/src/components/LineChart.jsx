import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const themeColors = {
  dark: {
    text: "rgba(226, 232, 240, 0.8)",
    textSecondary: "rgba(226, 232, 240, 0.6)",
    gridLight: "rgba(124, 58, 237, 0.1)",
    gridLighter: "rgba(124, 58, 237, 0.05)",
    tooltipBg: "rgba(15, 23, 42, 0.9)",
    tooltipText: "#f8fafc",
    tooltipBorder: "#7c3aed"
  },
  light: {
    text: "#1e293b",
    textSecondary: "#64748b",
    gridLight: "rgba(203, 213, 225, 0.3)",
    gridLighter: "rgba(203, 213, 225, 0.15)",
    tooltipBg: "#ffffff",
    tooltipText: "#0f172a",
    tooltipBorder: "#7c3aed"
  }
};

function readTheme() {
  return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
}

export function LineChart({ labels, values, title = "Completions" }) {
  const [theme, setTheme] = useState(readTheme());

  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "data-theme") {
          setTheme(readTheme());
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  const colors = themeColors[theme];

  const data = {
    labels,
    datasets: [
      {
        label: title,
        data: values,
        borderColor: "#06b6d4",
        backgroundColor: "rgba(6, 182, 212, 0.08)",
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointBackgroundColor: "#06b6d4",
        pointBorderColor: theme === "dark" ? "#ffffff" : "#0f172a",
        pointBorderWidth: 2,
        pointHoverRadius: 6
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: true,
        labels: {
          color: colors.text,
          font: { size: 12, weight: "500" }
        }
      },
      tooltip: {
        backgroundColor: colors.tooltipBg,
        titleColor: colors.tooltipText,
        bodyColor: colors.tooltipText,
        borderColor: colors.tooltipBorder,
        borderWidth: 1,
        padding: 12,
        borderRadius: 8
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: colors.textSecondary },
        grid: { color: colors.gridLight }
      },
      x: {
        ticks: { color: colors.textSecondary },
        grid: { color: colors.gridLighter }
      }
    }
  };

  return <Line data={data} options={options} />;
}
