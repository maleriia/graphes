const container = document.getElementById("draw");
let elements = [];
const uaScores = table.Ukraine;
for (const votedCountry in uaScores) {
  if (Object.hasOwnProperty.call(uaScores, votedCountry)) {
    const score = uaScores[votedCountry];
    if (votedCountry == "total") {
      continue;
    }
    elements.push({
      data: { id: votedCountry },
      style: {
        "background-image": Backgrounds[votedCountry],
        "background-fit": "cover",
      },
    });
  }
}
for (const country in table) {
  const scores = table[country];
  for (const votedCountry in scores) {
    const score = scores[votedCountry];
    if (votedCountry == "total") {
      continue;
    }
    if (votedCountry == country) {
      continue;
    }

    if (score == 0) {
      continue;
    }
    elements.push({
      data: {
        id: `${votedCountry}${country}`,
        source: votedCountry,
        target: country,
      },

      style: {
        "z-index": score,
      },
    });
  }
}

let cy = cytoscape({
  elements,
  container,
  style,
  layout,
  boxSelectionEnabled: false,
  selectionType: "single",
});
init(cy);
const state = {
  incomers: false,
  outgoers: false,
};

function assortativity() {
  let r = 0;

  let a = 0;
  let b = 0;
  let c = 0;

  const nodesConnections = {};
  cy.nodes().forEach(
    //                      county name    number of edges connected to this country
    (el) => (nodesConnections[el.id()] = el.connectedEdges().length)
  );

  const jArr = [];

  const kArr = [];
  // j - source, k - target
  cy.edges().forEach((el) => {
    const jNodeId = el.source().id();
    const jNodeConnections = nodesConnections[jNodeId];
    jArr.push(jNodeConnections);

    const kNodeId = el.target().id();
    const kNodeConnections = nodesConnections[kNodeId];
    kArr.push(kNodeConnections);
  });
  //                 current j value || j[i]*k[i]
  const jMulKArr = jArr.map((val, i) => val * kArr[i]);

  const sumElems = (partialSum, a) => partialSum + a;
  const sumSquaredElems = (partialSum, a) => partialSum + a * a;

  a = jMulKArr.reduce(sumElems, 0);
  b = jArr.reduce(sumSquaredElems, 0);
  c = Math.pow(jArr.reduce(sumElems, 0), 2);

  r = (a - c) / (b - c);

  return r;
}
function incomers() {
  const btn = document.getElementById("incomers");
  if (!state.incomers) {
    btn.classList.remove("btn-light");
    btn.classList.add("btn-warning");
  } else {
    btn.classList.remove("btn-warning");
    btn.classList.add("btn-light");
  }
  state.incomers = !state.incomers;
  update();
}

function outgoers() {
  const btn = document.getElementById("outgoers");
  if (!state.outgoers) {
    btn.classList.remove("btn-light");
    btn.classList.add("btn-success");
  } else {
    btn.classList.remove("btn-success");
    btn.classList.add("btn-light");
  }
  state.outgoers = !state.outgoers;
  update();
}
function saveCanvas() {
  html2canvas(document.body, {
    onrendered: function (canvas) {
      return Canvas2Image.saveAsPNG(canvas, null, null, "graph");
    },
  });
}

function randomize() {
  layout = {
    name: "random",
    animate: true, // whether to transition the node positions
    animationDuration: 2000, // duration of animation in ms if enabled
  };
  cy = cytoscape({ elements, container, style, layout });
  init(cy);
}
function init(cy) {
  cy.on("oneclick", () => {
    update();
  });
}

function update() {
  let selectedCollection = cy.$(":selected");
  let mainNode = selectedCollection.id();
  let incomers = cy.collection();
  let outgoers = cy.collection();
  if (state.incomers) {
    incomers = selectedCollection.incomers();
  }
  if (state.outgoers) {
    outgoers = selectedCollection.outgoers();
  }
  let highlighted = incomers.union(outgoers);
  let neutral = highlighted.union(selectedCollection).absoluteComplement();
  highlighted.forEach(makeElHighlighted);
  neutral.forEach(makeElNeutral);
  selectedCollection.forEach(makeElSelected);

  // charts
  drawCharts(mainNode, outgoers, incomers);
}

function drawCharts(mainNode, outgoers, incomers) {
  const outgoersData = getOutgoersData(outgoers);
  const incomersData = getIncomersData(incomers);

  const incomes = Object.values(incomersData);
  const outcomes = Object.values(outgoersData);

  const sumElems = (partialSum, a) => partialSum + Number(a);
  const totalIncome = incomes.reduce(sumElems, 0);
  const totalOutcome = outcomes.reduce(sumElems, 0);

  const countriesSet = new Set();
  const outgoersCountries = Object.keys(outgoersData);
  const incomersCountries = Object.keys(incomersData);

  //create list of countries, no repeat
  outgoersCountries
    .concat(incomersCountries)
    .forEach(countriesSet.add, countriesSet);

  const baseSize = Math.floor(countriesSet.size / chartsLength); //get size for every chart

  let countriesArray = Array.from(countriesSet);
  let datasetsSizes = [];
  for (let i = 0; i < chartsLength; i++) {
    datasetsSizes.push(baseSize);
  }
  let column = countriesArray.length % chartsLength;
  for (let i = 0; i < column; i++) {
    datasetsSizes[i]++;
  }

  let title = `${mainNode}`;
  if (state.incomers || state.outgoers) {
    title += ` | total votes `;
  }
  if (state.outgoers) {
    title += `from:${totalOutcome}`;
  }

  if (state.incomers && state.outgoers) {
    title += ` & `;
  }
  if (state.incomers) {
    title += `to:${totalIncome} `;
  }

  charts[0].config.options.plugins.title.text = title;
  countryPointer = 0;
  countriesArray = countriesArray.map((el) => {
    if (el.length > 10) {
      return el.slice(0, 10);
    } else {
      return el;
    }
  });
  for (let i = 0; i < chartsLength; i++) {
    const chart = charts[i];
    const datasetSize = datasetsSizes[i];
    fillChart(chart, datasetSize);
  }
  // console.log(chart0.data.datasets[0].data);

  // chart.config.option.plugins.title[display] = true;

  function fillChart(chart, datasetSize) {
    //get countries for every chart

    chart.config.data.labels = countriesArray.slice(
      countryPointer,
      countryPointer + datasetSize
    );

    let whatCountry = countriesArray.slice(
      countryPointer,
      countryPointer + datasetSize
    );
    countryPointer += datasetSize; //next slice

    let outgoersVotes = [];
    for (let k = 0; k < datasetSize; k++) {
      let fuck = whatCountry[k];
      fuck.toString();
      outgoersVotes.push(outgoersData[fuck]);
    }
    chart.config.data.datasets[0].data = outgoersVotes;

    let incomersVotes = [];
    for (let k = 0; k < datasetSize; k++) {
      let shit = whatCountry[k];
      shit.toString();
      let value = -incomersData[shit];
      // console.log(value);
      incomersVotes.push(value);
    }

    chart.config.data.datasets[1].data = incomersVotes;

    chart.config.data.datasets[0].label = `votes from ${mainNode}`; //display labels
    chart.config.data.datasets[1].label = `votes for ${mainNode}`;

    chart.update();
    return countryPointer;
  }
}

function getOutgoersData(outgoers) {
  const outgoersData = {};
  outgoers.forEach((outgoer) => {
    if (outgoer.isEdge()) {
      const country = outgoer.data("target");
      const votes = outgoer.style("z-index");
      outgoersData[country] = votes;
    }
  });
  // console.log(outgoersData);
  return outgoersData;
}
function getIncomersData(incomers) {
  const incomersData = {};
  incomers.forEach((incomer) => {
    if (incomer.isEdge()) {
      const country = incomer.data("source");
      const votes = incomer.style("z-index");
      incomersData[country] = votes;
    }
  });
  return incomersData;
}

function makeElHighlighted(el) {
  let highlightedStyle;
  if (el.isNode()) highlightedStyle = styles.nodeHighlighted;
  else if (el.isEdge()) {
    highlightedStyle = styles.edgeHighlighted;
  } else return;
  applyStyleIfNotApplied(el, highlightedStyle);
}
function makeElNeutral(el) {
  let neutralStyle;
  if (el.isNode()) neutralStyle = styles.node;
  else if (el.isEdge()) neutralStyle = styles.edge;
  else return;

  applyStyleIfNotApplied(el, neutralStyle);
}
function makeElSelected(el) {
  applyStyleIfNotApplied(el, styles.nodeSelected);
}
function applyStyleIfNotApplied(el, style) {
  for (const styleName in style) {
    if (Object.hasOwnProperty.call(style, styleName)) {
      if (styleName == "label" || styleName == "font-family") continue;
      const styleValue = style[styleName];
      if (el.style(styleName) != styleValue) {
        el.animate({
          style: style,
        });
        break;
      }
    }
  }
}
setTimeout(() => {
  let answer = confirm("Would you like to see assortativity?");
  if (answer)
    setTimeout(() => alert(`Okey, assortativity: ${assortativity()}`), 500);
  else
    setTimeout(
      () => alert(`I'll show u anyway, assortativity: ${assortativity()}`),
      1000
    );
}, 1000);
