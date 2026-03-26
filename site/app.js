
// import { greet } from './utils.js';
// import { formatProduct, af } from './formatter.js';


var output = document.getElementById('output');
function log(msg) {
  output.textContent += msg + '\n';
}

(async () => {

  log('=============================cyclic import=======================')
  var { add, greet } = await import('./utils.js');

  log(greet('World'));
  log('2 + 3 = ' + add(2, 3));

  var moduleName = './math.js';
  var math = await import(moduleName);
  log('3 * 4 = ' + math.multiply(3, 4));
  log('5^2 = ' + math.square(5));
  log('=============================cyclic import========================')


  // static import from formatter (shared dep with math.js)
  // log(formatProduct(6, 7));
  // log('af.version = ' + af.version);

  // // .then() on dynamic import
  // import('./formatter.js').then(function (m) {
  //   log('.then() formatProduct: ' + m.formatProduct(8, 9));
  // });

  try {
    log('=============================static block========================')
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
    log('=============================static block========================')
  } catch (e) {
    log('ERROR: ' + e.message);
  }
})()

export const meta = {
  name: 'app',
  version: '1.0.0',
};