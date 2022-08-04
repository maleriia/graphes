const DATA_COUNT = 7;
const NUMBER_CFG = { count: DATA_COUNT, min: -100, max: 100 };

const labels = [];
const data = {
  labels: labels,
  datasets: [
    {
      label: "votes from ",
      data: [0, 0, 50, 0, 55, 0, 0],
      backgroundColor: "#045658",
      // backgroundColor: "#049CE4",
    },
    {
      label: "votes for ",
      data: [0, -91, -5, 0, -2, -82, 0],
      backgroundColor: "#f7ea7e",
      // backgroundColor: "#ffd500",
    },
  ],
};
