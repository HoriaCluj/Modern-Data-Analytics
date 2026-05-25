const katex = require('katex');
try {
  console.log("text command:", katex.renderToString("\\text{hello world}"));
} catch (e) { console.log(e.message); }
