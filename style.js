// Styles presets
let styles = {
  node: {
    // "background-color": colors.nodeMain,
    label: "data(id)",
    visibility: "visible",
    "font-family": "Roboto,sans-serif",
    "font-weight": "300",
    "font-style": "normal",
    "border-width": 0,
  },

  nodeSelected: {
    "background-color": colors.nodeSelected,
    "border-color": colors.nodeSelected,
    "border-width": 3,
  },
  nodeHighlighted: {
    "background-color": colors.nodeSelectedSecond,
  },
  edge: {
    width: "0.5px",
    "line-color": colors.arrowMain,
    "target-arrow-color": colors.arrowMain,
    "target-arrow-shape": "triangle",
    "curve-style": "bezier",
  },
  edgeHighlighted: {
    "line-color": colors.arrowSelected,
    "target-arrow-color": colors.arrowSelected,
  },
};
// the stylesheet for the graph
let style = [
  {
    selector: "node",
    style: styles.node,
  },
  {
    selector: "edge",
    style: styles.edge,
  },
];

layout = {
  name: "grid",
};
