const React = require('react');
const ReactDOMServer = require('react-dom/server');
const { BlockMath } = require('react-katex');

const str = "\\text{MCPI}_m = \\alpha \\underbrace{\\left( \\frac{\\text{Weighted Accidents}_m}{\\text{Predicted Traffic}_m} \\right)}_{\\text{accident rate per cyclist}} + \\beta \\underbrace{(\\text{Infrastructure Deficit}_m)}_{\\text{infra gap}} + \\gamma \\underbrace{\\left( \\frac{\\text{Predicted Traffic}_m}{\\text{Population}_m} \\right)}_{\\text{cycling adoption rate}}";

const el = React.createElement(BlockMath, { math: str });
console.log(ReactDOMServer.renderToString(el));
