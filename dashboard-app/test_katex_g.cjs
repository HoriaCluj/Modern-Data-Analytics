const katex = require('katex');
try {
  console.log("With \g:", katex.renderToString("\\g"));
} catch (e) { console.log(e.message); }
