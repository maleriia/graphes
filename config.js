const config = {
  type: "bar",
  data: data,
  options: {
    plugins: {
      title: {
        // text: "MainNode",
        display: true,
        // text: "Chart.js Bar Chart - Stacked",
      },

      tooltip: {
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || "";

            if (label) {
              label += ": ";
            }
            if (context.parsed.y !== null) {
              label += Math.abs(context.parsed.y);
            }
            return label;
          },
        },
      },
    },
    responsive: true,
    scales: {
      x: {
        stacked: true,
      },
      y: {
        stacked: true,
      },
    },
  },
};
