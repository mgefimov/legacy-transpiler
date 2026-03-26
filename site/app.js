import { greet } from './utils.js';

var output = document.getElementById('output');
function log(msg) {
  output.textContent += msg + '\n';
}

log(greet('World'));

var { add } = await import('./utils.js');
log('2 + 3 = ' + add(2, 3));

var moduleName = './math.js';
var math = await import(moduleName);
log('3 * 4 = ' + math.multiply(3, 4));
log('5^2 = ' + math.square(5));

try {
  class Counter {
    static count;
    static {
      this.count = 0;
      log('static block executed, count = ' + this.count);
    }
    static increment() {
      this.count++;
      return this.count;
    }
  }

  log('Counter.count = ' + Counter.count);
  log('Counter.increment() = ' + Counter.increment());
  log('Counter.increment() = ' + Counter.increment());
  log('Counter.count = ' + Counter.count);
} catch (e) {
  log('ERROR: ' + e.message);
}
