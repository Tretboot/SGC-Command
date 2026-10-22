const fs = require('fs');
const path = require('path');
const vm = require('vm');

let src = fs.readFileSync('test-browser.js', 'utf8');
src = src.replace("console.log('✔ ALL TESTS PASSED (0 errors)');", "");
const ctx = {
  require,
  console,
  __dirname: process.cwd(),
  process,
  setTimeout,
  clearTimeout,
  setInterval,
  clearInterval
};
ctx.global = ctx;
vm.createContext(ctx);
vm.runInContext(src, ctx);

let errors = 0;
for (const [k, tr] of Object.entries(ctx.STRUDEL_TRACKS)) {
  for (let iter = 0; iter < 10; iter++) {
    const mutated = ctx.STRUDEL.mutateCode(tr.code, 0.7);
    try {
      const v = ctx.STRUDEL.compile(mutated);
      if (!v || v.length === 0) {
        console.warn('0 voices for ' + k + ' iter ' + iter);
      }
    } catch (e) {
      console.error('COMPILE ERROR on ' + k + ' iter ' + iter + ':', e.message);
      errors++;
    }
  }
}
console.log('Finished testing mutations. Total errors:', errors);
