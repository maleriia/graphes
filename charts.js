const ctx1 = document.getElementById("myChart1").getContext("2d");
const ctx2 = document.getElementById("myChart2").getContext("2d");
const ctx3 = document.getElementById("myChart3").getContext("2d");
//record object config as strings in memory cells, then parse in object. Thus, we will get object, which link to different memory cells and are independent of changes each other.
const chart0 = new Chart(ctx1, config);
const boobs = JSON.parse(JSON.stringify(config));
const chart1 = new Chart(ctx2, JSON.parse(JSON.stringify(config)));

const chart2 = new Chart(ctx3, JSON.parse(JSON.stringify(config)));
const charts = [chart0, chart1, chart2];
const chartsLength = charts.length;
// console.log(chart0.config.data.labels.length);
