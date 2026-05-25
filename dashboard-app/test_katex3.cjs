const katex = require('katex');
try {
  console.log("With 1 backslash:", katex.renderToString("\gamma"));
} catch (e) { console.log(e.message); }
