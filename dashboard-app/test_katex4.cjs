const katex = require('katex');
try {
  console.log("With 2 backslashes:", katex.renderToString("\\gamma"));
} catch (e) { console.log(e.message); }
