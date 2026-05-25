const katex = require('katex');
try {
  console.log(katex.renderToString("\\\\beta"));
} catch (e) { console.log(e.message); }
